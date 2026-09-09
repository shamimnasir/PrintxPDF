// Generic command stack used by the editor. Each command knows how to undo itself.
export type Command = { label: string; undo: () => void; redo: () => void }

export class UndoStack {
  private past: Command[] = []
  private future: Command[] = []
  private listeners = new Set<() => void>()

  push(cmd: Command) {
    this.past.push(cmd)
    this.future = []
    this.emit()
  }
  undo() {
    const cmd = this.past.pop()
    if (!cmd) return false
    cmd.undo()
    this.future.push(cmd)
    this.emit()
    return true
  }
  redo() {
    const cmd = this.future.pop()
    if (!cmd) return false
    cmd.redo()
    this.past.push(cmd)
    this.emit()
    return true
  }
  clear() {
    this.past = []
    this.future = []
    this.emit()
  }
  get canUndo() {
    return this.past.length > 0
  }
  get canRedo() {
    return this.future.length > 0
  }
  get size() {
    return this.past.length
  }
  subscribe(fn: () => void) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }
  private emit() {
    this.listeners.forEach((fn) => fn())
  }
}
