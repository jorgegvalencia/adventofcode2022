import os from 'os'

class TreeNode {
  constructor(key, type, value = key, name, parent = null) {
    this.key = key
    this.type = type
    this.value = value
    this.name = name
    this.parent = parent
    this.children = []
  }

  get isLeaf() {
    return this.children.length === 0
  }

  get hasChildren() {
    return !this.isLeaf
  }

  get depth () {
    let n = 0
    const findDepth = (node, n) => {
      if (!node) return n
      return findDepth(node.parent, n + 1)
    }
    return findDepth(this.parent, n)
  }

  computeNodeValue () {
    if (this.isLeaf) {
      return this.value
    } else {
      return this.children.reduce((value, childNode) => value += childNode.value, 0)
    }
  }

  updateTreeNodeValue () {
    this.value = this.computeNodeValue()
    if (this.parent) {
      this.parent.updateValue(this.value)
    }
  }

  toString() {
    const childrenString = this.children
      .sort((a, b) => a.key - b.key)
      .map(child => {
        const entry = child.toString()
        return entry
      })
      .join('')
  
    return `${'\t'.repeat(this.depth)}${this.name} (${this.type}, size=${this.value})${os.EOL}${childrenString}` // + os.EOL + (this.children.length ? '\t' + childrenString : '')
  }
}


export default class Tree {
  constructor(key, type, value = key, name = key) {
    this.root = new TreeNode(key, type, value, name)
  }

  *preOrderTraversal(node = this.root) {
    yield node
    if (node.children.length) {
      for (let child of node.children) {
        yield* this.preOrderTraversal(child)
      }
    }
  }

  *postOrderTraversal(node = this.root) {
    if (node.children.length) {
      for (let child of node.children) {
        yield* this.postOrderTraversal(child)
      }
    }
    yield node
  }

  insert({ parentNodeKey, type, key, value = key, name } = {}) {
    for (let node of this.preOrderTraversal()) {
      if (node.key === parentNodeKey) {
        node.children.push(new TreeNode(key, type, value, name, node))
        return true
      }
    }
    return false
  }

  remove(key) {
    for (let node of this.preOrderTraversal()) {
      const filtered = node.children.filter(c => c.key !== key)
      if (filtered.length !== node.children.length) {
        node.children = filtered
        return true
      }
    }
    return false
  }

  find(key) {
    for (let node of this.preOrderTraversal()) {
      if (node.key === key) return node
    }
    return undefined
  }

  print() {
    this.root.print()
  }

  toString() {
    return this.root.toString()
  }
}