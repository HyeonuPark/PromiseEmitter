function PromiseEmitter() {
    this.chain = [];
}

PromiseEmitter.prototype.then = function then(resolve, reject) {
    this.chain.push({
        resolve : resolve,
        reject : reject
    });
    return this;
};

PromiseEmitter.prototype.catch = function(reject) {
    return this.then(null, reject);
};

PromiseEmitter.prototype.emit = function emit(event) {
    var promise = Promise.resolve(event);
    this.chain.forEach(function(each) {
        promise = promise.then(each.resolve, each.reject);
    });
    return promise;
};

module.exports = PromiseEmitter;