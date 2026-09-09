import { describe, expect, it } from 'vitest'
import { UndoStack } from '../undoStack'

describe('UndoStack', () => {
  it('undoes and redoes in order, clearing redo on new push', () => {
    const s = new UndoStack()
    const log: string[] = []
    const cmd = (n: string) => ({ label: n, undo: () => log.push(`u${n}`), redo: () => log.push(`r${n}`) })
    s.push(cmd('a'))
    s.push(cmd('b'))
    expect(s.canUndo).toBe(true)
    s.undo()
    s.undo()
    expect(s.canUndo).toBe(false)
    expect(log).toEqual(['ub', 'ua'])
    s.redo()
    expect(log).toEqual(['ub', 'ua', 'ra'])
    s.push(cmd('c'))
    expect(s.canRedo).toBe(false)
    expect(s.size).toBe(2)
  })
  it('notifies subscribers', () => {
    const s = new UndoStack()
    let n = 0
    const off = s.subscribe(() => n++)
    s.push({ label: 'x', undo() {}, redo() {} })
    s.undo()
    off()
    s.redo()
    expect(n).toBe(2)
  })
})
