import { getDb } from './db';

export interface ExtractedRequestDraft {
  title: string;
  description: string;
  assigneeId: string | null;
  assigneeName: string | null;
  clientId: string | null;
  clientName: string | null;
  priority: 'high' | 'medium' | 'low';
  dueDate: string | null;
  category: string;
  source: 'whatsapp' | 'email' | 'phone' | 'website' | 'manual' | 'other';
  confidence: {
    title: 'high' | 'medium' | 'low';
    assignee: 'high' | 'medium' | 'low';
    priority: 'high' | 'medium' | 'low';
    dueDate: 'high' | 'medium' | 'low';
    category: 'high' | 'medium' | 'low';
  };
}

export async function extractRequestFromText(rawText: string): Promise<ExtractedRequestDraft> {
  const apiKey = process.env.GEMINI_API_KEY;
  const db = getDb();
  const users = db.prepare('SELECT id, full_name FROM users').all() as { id: string; full_name: string }[];
  const clients = db.prepare('SELECT id, name, company_name FROM clients').all() as { id: string; name: string; company_name: string }[];

  // If Gemini API Key is available, try invoking Gemini
  if (apiKey) {
    try {
      const prompt = `
You are an AI assistant in Lala Tech Operations Hub.
Convert this raw message into a structured request draft.
Team members available: ${users.map((u) => u.full_name).join(', ')}.
Clients available: ${clients.map((c) => `${c.company_name} (${c.name})`).join(', ')}.

Respond ONLY with valid JSON in this exact structure:
{
  "title": "short actionable title (max 80 chars)",
  "description": "clean description",
  "assignee_name": "exact team member name or null",
  "client_name": "matched client company or contact name or null",
  "priority": "high" | "medium" | "low",
  "due_date": "YYYY-MM-DD" or null,
  "category": "Sales" | "Logistics" | "Support" | "Finance" | "Operations" | "Other",
  "source": "whatsapp" | "email" | "phone" | "website" | "manual" | "other"
}

Raw message:
"${rawText.replace(/"/g, '\\"')}"
`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textResponse) {
          const parsed = JSON.parse(textResponse);
          // Match user
          let matchedAssignee = null;
          if (parsed.assignee_name) {
            const u = users.find((usr) => usr.full_name.toLowerCase().includes(parsed.assignee_name.toLowerCase()));
            if (u) matchedAssignee = u;
          }
          // Match client
          let matchedClient = null;
          if (parsed.client_name) {
            const c = clients.find((cli) => 
              cli.company_name.toLowerCase().includes(parsed.client_name.toLowerCase()) || 
              cli.name.toLowerCase().includes(parsed.client_name.toLowerCase())
            );
            if (c) matchedClient = c;
          }

          return {
            title: parsed.title || 'Incoming Client Request',
            description: parsed.description || rawText,
            assigneeId: matchedAssignee?.id || null,
            assigneeName: matchedAssignee?.full_name || parsed.assignee_name || null,
            clientId: matchedClient?.id || null,
            clientName: matchedClient?.company_name || parsed.client_name || null,
            priority: ['high', 'medium', 'low'].includes(parsed.priority) ? parsed.priority : 'medium',
            dueDate: parsed.due_date || null,
            category: parsed.category || 'Operations',
            source: parsed.source || 'whatsapp',
            confidence: {
              title: 'high',
              assignee: matchedAssignee ? 'high' : 'medium',
              priority: 'high',
              dueDate: parsed.due_date ? 'high' : 'low',
              category: 'high',
            }
          };
        }
      }
    } catch (e) {
      console.warn('Gemini extraction failed, falling back to local extractor:', e);
    }
  }

  // Robust Heuristic Local Extractor (guarantees seamless offline / zero-setup operation)
  const lower = rawText.toLowerCase();

  // 1. Assignee matching
  let matchedAssignee: { id: string; full_name: string } | null = null;
  for (const user of users) {
    const firstName = user.full_name.split(' ')[0].toLowerCase();
    if (lower.includes(firstName) || lower.includes(user.full_name.toLowerCase())) {
      matchedAssignee = user;
      break;
    }
  }

  // 2. Client matching
  let matchedClient: { id: string; company_name: string; name: string } | null = null;
  for (const client of clients) {
    const companyLower = client.company_name.toLowerCase();
    const cleanCompany = companyLower.replace(/\b(ltd|llc|co|corp|inc|solutions|media|worldwide)\b/gi, '').trim();
    const contactFirst = client.name.split(' ')[0].toLowerCase();
    if (
      lower.includes(companyLower) ||
      (cleanCompany.length > 2 && lower.includes(cleanCompany)) ||
      lower.includes(contactFirst)
    ) {
      matchedClient = client;
      break;
    }
  }

  // 3. Priority detection
  let priority: 'high' | 'medium' | 'low' = 'medium';
  let priorityConf: 'high' | 'medium' | 'low' = 'low';
  if (lower.includes('urgent') || lower.includes('asap') || lower.includes('immediately') || lower.includes('critical') || lower.includes('emergency')) {
    priority = 'high';
    priorityConf = 'high';
  } else if (lower.includes('low priority') || lower.includes('whenever') || lower.includes('no rush')) {
    priority = 'low';
    priorityConf = 'high';
  }

  // 4. Due Date estimation
  let dueDate: string | null = null;
  let dateConf: 'high' | 'medium' | 'low' = 'low';
  const now = new Date();
  if (lower.includes('tomorrow')) {
    const d = new Date(now.getTime() + 86400000);
    dueDate = d.toISOString().split('T')[0];
    dateConf = 'high';
  } else if (lower.includes('today') || lower.includes('tonight') || lower.includes('by eod')) {
    dueDate = now.toISOString().split('T')[0];
    dateConf = 'high';
  } else if (lower.includes('next week')) {
    const d = new Date(now.getTime() + 7 * 86400000);
    dueDate = d.toISOString().split('T')[0];
    dateConf = 'medium';
  }

  // 5. Category detection
  let category = 'Operations';
  if (lower.includes('invoice') || lower.includes('payment') || lower.includes('bill') || lower.includes('ledger') || lower.includes('refund')) {
    category = 'Finance';
  } else if (lower.includes('delivery') || lower.includes('dispatch') || lower.includes('courier') || lower.includes('shipment') || lower.includes('order')) {
    category = 'Logistics';
  } else if (lower.includes('complaint') || lower.includes('issue') || lower.includes('support') || lower.includes('help')) {
    category = 'Support';
  } else if (lower.includes('quote') || lower.includes('catalog') || lower.includes('sales') || lower.includes('price')) {
    category = 'Sales';
  }

  // 6. Source detection
  let source: 'whatsapp' | 'email' | 'phone' | 'website' | 'manual' | 'other' = 'whatsapp';
  if (lower.includes('email') || lower.includes('inbox')) {
    source = 'email';
  } else if (lower.includes('call') || lower.includes('phone') || lower.includes('spoke')) {
    source = 'phone';
  } else if (lower.includes('website') || lower.includes('portal') || lower.includes('form')) {
    source = 'website';
  }

  // 7. Title formulation
  let title = 'Client Request';
  // Try extracting action phrases
  const sendInvoiceMatch = rawText.match(/(?:please\s+|kindly\s+)?(send\s+[^.,]+|follow\s+up\s+[^.,]+|check\s+[^.,]+|resolve\s+[^.,]+|review\s+[^.,]+|prepare\s+[^.,]+)/i);
  if (sendInvoiceMatch) {
    title = sendInvoiceMatch[1].trim();
    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);
    if (title.length > 70) title = title.substring(0, 67) + '...';
  } else {
    // Take first sentence or first 60 characters
    const firstSentence = rawText.split(/[.\n]/)[0].trim();
    title = firstSentence.length > 60 ? firstSentence.substring(0, 57) + '...' : firstSentence || 'Incoming Request';
  }

  return {
    title,
    description: rawText.trim(),
    assigneeId: matchedAssignee?.id || null,
    assigneeName: matchedAssignee?.full_name || null,
    clientId: matchedClient?.id || null,
    clientName: matchedClient?.company_name || null,
    priority,
    dueDate,
    category,
    source,
    confidence: {
      title: 'high',
      assignee: matchedAssignee ? 'high' : 'low',
      priority: priorityConf,
      dueDate: dateConf,
      category: 'high',
    }
  };
}
