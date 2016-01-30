'use strict'
var directiveParser = require('./directive-parser.js')
module.exports = {
  stack: [],
  pop: function (current) {
    var index = this.stack.indexOf(current)
    if (index !== -1) {
      this.stack.splice(index, 1)
    }
    if (!current.preserve) {
      current.source.remove()
    }
  },
  parse: function (node, callback) {
    var current
    var metadata = directiveParser(node)
    if (metadata) {
      if (!metadata.begin && metadata.end) {
        this.walk(function (item) {
          if (metadata.option === item.metadata.option) {
            this.pop(item)
            current = {'metadata': metadata, 'directive': item.directive, 'source': node, 'preserve': item.preserve}
            return false
          }
        }.bind(this))
      } else {
        current = {'metadata': metadata, 'directive': null, 'source': node, 'preserve': null}
      }
      if (callback(current)) {
        this.stack.push(current)
      } else if (!current.preserve) {
        current.source.remove()
      }
    }
  },
  walk: function (callback) {
    var len = this.stack.length
    while (--len > -1) {
      if (!callback(this.stack[len])) {
        break
      }
    }
  }
}