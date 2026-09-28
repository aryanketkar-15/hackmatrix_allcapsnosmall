import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { dataReady, renderAt } from '../test/renderApp';
import { readCore, readScenario } from '../test/fixtures';
import { findNode, nodeLink } from './GraphExplorer';
import { toElements } from '../components/graph/toElements';

const core = readCore();
const ownerOf = new Map(core.customers.flatMap((c) => c.accountIds.map((a) => [a, c.id] as const)));

describe('Graph Explorer helpers', () => {
  it('finds nodes by id, label or sub-label and ignores blanks', () => {
    const s1 = readScenario('S1');
    expect(findNode(s1, 'B-207')?.id).toBe('B-207');
    expect(findNode(s1, 'e17')?.id).toBe('E17');
    expect(findNode(s1, 'zzz')).toBeUndefined();
    expect(findNode(s1, '  ')).toBeUndefined();
  });
  it('links customers, employees and account owners', () => {
    const s1 = readScenario('S1');
    expect(nodeLink(s1.nodes.find((n) => n.id === 'C001')!, ownerOf)?.to).toBe('/customers/C001/overview');
    expect(nodeLink(s1.nodes.find((n) => n.id === 'E17')!, ownerOf)?.to).toBe('/employees/E17');
    expect(nodeLink(s1.nodes.find((n) => n.id === 'A-001')!, ownerOf)?.to).toBe('/customers/C001/accounts');
    expect(nodeLink(s1.nodes.find((n) => n.id === 'X-901')!, ownerOf)).toBeNull();
  });
  it('the explorer uses the same elements as the alert graph', () => {
    expect(toElements(readScenario('S1')).length).toBeGreaterThan(10);
  });
});

describe('Graph Explorer page', () => {
  it('loads S1 and highlights a searched node', async () => {
    const user = userEvent.setup();
    renderAt('/graph-explorer');
    await dataReady();
    await screen.findByRole('img', { name: /Money-flow graph for Circular transfer with employee link/ });
    await user.type(screen.getByLabelText('Find a node'), 'B-207');
    await waitFor(() => expect(screen.getByTestId('selected-node')).toHaveTextContent('B-207'));
    expect(screen.getByRole('list', { name: 'Neighbours' })).toHaveTextContent('A-001');
  });
  it('says "No match" for an unknown node', async () => {
    const user = userEvent.setup();
    renderAt('/graph-explorer');
    await dataReady();
    await user.type(await screen.findByLabelText('Find a node'), 'zzz');
    expect(await screen.findByText(/No match for/)).toBeInTheDocument();
  });
  it('switches scenarios', async () => {
    const user = userEvent.setup();
    renderAt('/graph-explorer');
    await dataReady();
    await user.selectOptions(await screen.findByLabelText('Scenario'), 'S4');
    await screen.findByRole('img', { name: /Treasury sweep/ });
  });
});
