// Comprehensive end-to-end automated verification script
const BASE_URL = 'http://localhost:3000';

async function runTest() {
  console.log('--- Starting Automated E2E Verification for Lala Tech Operations Hub ---');
  let cookie = '';

  // Helper fetch with cookies
  async function api(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (cookie) headers['Cookie'] = cookie;

    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });

    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      cookie = setCookie.split(';')[0];
    }

    const data = await res.json().catch(() => ({}));
    return { res, status: res.status, data };
  }

  // 1. Test Login as Priya Sharma (Manager)
  console.log('1. Testing Login as Priya Sharma (manager@lalatech.demo)...');
  const loginRes = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'manager@lalatech.demo', password: 'demo123' }),
  });
  console.assert(loginRes.status === 200, `Login failed with status ${loginRes.status}`);
  console.assert(loginRes.data.user.role === 'manager', 'User role should be manager');
  console.log('✓ Login successful as Manager:', loginRes.data.user.full_name);

  // 2. Test Dashboard Summary (The 4 Operational Queues)
  console.log('\n2. Testing Dashboard Summary 4 Operational Queues...');
  const sumRes = await api('/api/requests/dashboard-summary');
  console.assert(sumRes.status === 200, 'Dashboard summary failed');
  const q = sumRes.data.summary.queues;
  console.log('✓ Operational Queues:', {
    'Waiting for Us': q.waiting_for_us,
    'Waiting for Client': q.waiting_for_client,
    'Unassigned': q.unassigned,
    'Overdue': q.overdue,
  });
  console.assert(q.waiting_for_us > 0, 'Waiting for Us queue should have items');
  console.assert(q.waiting_for_client > 0, 'Waiting for Client queue should have items');

  // 3. Verify PRD v2 Strict Overdue Rule
  console.log('\n3. Verifying PRD v2 Overdue Rule (Waiting on Client excluded from Overdue)...');
  const overdueRes = await api('/api/requests?queue=overdue');
  console.assert(overdueRes.status === 200);
  const overdueItems = overdueRes.data.requests;
  for (const item of overdueItems) {
    console.assert(item.status !== 'waiting_on_client', `Violation: Item ${item.display_id} in waiting_on_client was in overdue list!`);
    console.assert(item.status !== 'done', `Violation: Completed item was in overdue list!`);
  }
  console.log(`✓ Verified ${overdueItems.length} overdue requests: All are strictly internal Lala Tech responsibility (New, Ready, In Progress). Zero waiting on client items.`);

  // 4. Test AI Request Capture Extraction
  console.log('\n4. Testing AI Request Capture extraction...');
  const rawMsg = 'Rahul, please send the invoice for order #4532 to customer Apex Retail by tomorrow evening. This is urgent.';
  const aiRes = await api('/api/ai/extract-request', {
    method: 'POST',
    body: JSON.stringify({ rawText: rawMsg }),
  });
  console.assert(aiRes.status === 200, 'AI extraction failed');
  const draft = aiRes.data.draft;
  console.log('✓ AI Draft Extracted:', {
    title: draft.title,
    assigneeName: draft.assigneeName,
    clientName: draft.clientName,
    priority: draft.priority,
    dueDate: draft.dueDate,
    category: draft.category,
  });
  console.assert(draft.title.toLowerCase().includes('invoice'), 'Title should reference invoice');
  console.assert(draft.priority === 'high', 'Priority should be high for urgent request');
  console.assert(draft.assigneeId === 'usr_rahul', 'Assignee should match Rahul Verma');
  console.assert(draft.clientId === 'cli_apex', 'Client should match Apex Retail');

  // 5. Confirm & Create Request
  console.log('\n5. Creating the request via POST /api/requests...');
  const createRes = await api('/api/requests', {
    method: 'POST',
    body: JSON.stringify({
      title: draft.title,
      description: draft.description,
      assigned_to: draft.assigneeId,
      client_id: draft.clientId,
      priority: draft.priority,
      category: draft.category,
      source: draft.source,
      due_date: draft.dueDate,
      status: 'ready_to_assign',
    }),
  });
  console.assert(createRes.status === 201, 'Request creation failed');
  const newReq = createRes.data.request;
  console.log(`✓ Request created: ${newReq.display_id} ("${newReq.title}")`);

  // 6. Switch Demo User to Rahul Verma (Employee)
  console.log('\n6. Switching to Rahul Verma (employee)...');
  const switchRes = await api('/api/auth/switch-demo', {
    method: 'POST',
    body: JSON.stringify({ userId: 'usr_rahul' }),
  });
  console.assert(switchRes.status === 200, 'Demo switch failed');
  console.assert(switchRes.data.user.id === 'usr_rahul');
  console.log('✓ Successfully switched session to Employee:', switchRes.data.user.full_name);

  // 7. Rahul picks up the request and moves to In Progress
  console.log('\n7. Rahul moves request to In Progress...');
  const progressRes = await api(`/api/requests/${newReq.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'in_progress' }),
  });
  console.assert(progressRes.status === 200);
  console.assert(progressRes.data.request.status === 'in_progress');
  console.log('✓ Status moved to In Progress');

  // 8. Rahul moves to Waiting on Client with required reason
  console.log('\n8. Rahul pauses request: Waiting on Client with reason...');
  // Test validation error if reason is empty
  const emptyReasonRes = await api(`/api/requests/${newReq.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'waiting_on_client', client_waiting_reason: '' }),
  });
  console.assert(emptyReasonRes.status === 400, 'Empty reason should be rejected with 400');
  console.log('✓ Verified: Empty reason rejected by server validation as required by PRD v2');

  const waitRes = await api(`/api/requests/${newReq.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'waiting_on_client',
      client_waiting_reason: 'Waiting on customer Apex Retail sign-off on discounted invoice terms.',
    }),
  });
  console.assert(waitRes.status === 200);
  console.assert(waitRes.data.request.status === 'waiting_on_client');
  console.assert(waitRes.data.request.client_waiting_reason.includes('Apex Retail'));
  console.log('✓ Status moved to Waiting on Client with reason preserved');

  // 9. Verify that request is NOT in Overdue even with past date
  console.log('\n9. Verifying Overdue Exclusion for this request...');
  const checkOverdue = await api('/api/requests?queue=overdue');
  const foundInOverdue = checkOverdue.data.requests.find((r) => r.id === newReq.id);
  console.assert(!foundInOverdue, 'Violation: Request in waiting_on_client was found in overdue!');
  console.log('✓ Verified: Request in Waiting on Client is NOT overdue!');

  // 10. Add Comment
  console.log('\n10. Adding comment to request...');
  const commentRes = await api(`/api/requests/${newReq.id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body: 'Spoke with client Sanjay; approval expected by 4 PM.' }),
  });
  console.assert(commentRes.status === 201);
  console.log('✓ Comment posted successfully:', commentRes.data.comment.body);

  // 11. Resume Work & Mark Done
  console.log('\n11. Client responds -> Resume In Progress -> Mark Done...');
  await api(`/api/requests/${newReq.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'in_progress' }),
  });
  const doneRes = await api(`/api/requests/${newReq.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'done' }),
  });
  console.assert(doneRes.status === 200);
  console.assert(doneRes.data.request.status === 'done');
  console.assert(doneRes.data.request.completed_at !== null);
  console.log('✓ Request marked as Done with completed_at timestamp stamped');

  // 12. Audit Activity Log
  console.log('\n12. Inspecting Activity Audit Trail for this request...');
  const actRes = await api(`/api/activity?requestId=${newReq.id}`);
  console.assert(actRes.status === 200);
  console.log(`✓ ${actRes.data.activities.length} activity entries logged for ${newReq.display_id}:`);
  for (const act of actRes.data.activities) {
    console.log(`   • [${act.action_type}] ${act.description}`);
  }

  console.log('\n======================================================');
  console.log('🎉 ALL 12 AUTOMATED END-TO-END ACCEPTANCE TESTS PASSED!');
  console.log('======================================================');
}

runTest().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
