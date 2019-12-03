export default class SubscriptionManager<T> {
  private subscriptionsById: {
    [id: string]: Set<(event: T) => void>
  } = {}

  public emit(id: string, event: T) {
    const subscriptions = this.subscriptionsById[id]

    if (!subscriptions) {
      return
    }

    for (const subscription of subscriptions.values()) {
      subscription(event)
    }
  }

  public hasSubscriptionsFor(id: string) {
    if (!this.subscriptionsById[id]) {
      return false
    }

    return this.subscriptionsById[id].size > 0
  }

  public subscribe(id: string, callback: (event: T) => void) {
    if (!this.subscriptionsById.hasOwnProperty(id)) {
      this.subscriptionsById[id] = new Set([callback])
    } else {
      this.subscriptionsById[id].add(callback)
    }
  }

  public unsubscribe(id: string, callback: (event: T) => void) {
    if (!this.subscriptionsById[id]) {
      return
    }

    this.subscriptionsById[id].delete(callback)

    if (this.subscriptionsById[id].size === 0) {
      delete this.subscriptionsById[id]
    }
  }
}
