// Per-record scroll ownership. Native scroll handles must be created outside render, so reads
// only queue missing records; the view flushes that queue from a deferred foreground task. Pure:
// the handle type and its factory come from the caller.

/**
 * Stable scroll handles keyed by record id, for one navigation target.
 */
export class RecordScrolls<Handle> {
  private handles = new Map<string, Handle>();
  private pending = new Set<string>();

  /**
   * Reads an existing handle or queues its record for later allocation.
   * @param id The record id.
   * @returns Its stable handle, or undefined until the deferred flush.
   */
  get(id: string): Handle | undefined {
    const handle = this.handles.get(id);
    if (handle === undefined) this.pending.add(id);
    return handle;
  }

  /**
   * Whether the view needs to schedule a deferred allocation task.
   * @returns True when at least one record is waiting.
   */
  get waiting(): boolean {
    return this.pending.size > 0;
  }

  /**
   * Allocates queued handles; call only outside render.
   * @param create The native handle factory.
   * @returns Whether any handles were created and a redraw is needed.
   */
  flush(create: () => Handle): boolean {
    const changed = this.pending.size > 0;
    for (const id of this.pending) this.handles.set(id, create());
    this.pending.clear();
    return changed;
  }

  /**
   * Clears ownership and queued allocations when the target or followed agent changes.
   */
  reset(): void {
    this.handles.clear();
    this.pending.clear();
  }
}
