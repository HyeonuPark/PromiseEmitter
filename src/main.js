function deepCheckCondition(target, condition) {
    if (condition && typeof condition.some === 'function') {
        return condition.some((elem) => deepCheckCondition(target, elem));
    } else if (typeof condition === 'object' && typeof target === 'object') {
        return Object.keys(condition).every((key) => deepCheckCondition(target[key], condition[key]));
    } else return target === condition;
}

export class PromiseEmitter {

    constructor(eventEmitter, eventName) {

        if (eventEmitter && typeof eventEmitter.on === 'function' && typeof eventEmitter.emit === 'function' &&
            eventName && typeof eventName === 'string') {

            eventEmitter.on(eventName, (data) => process.nextTick(() => this.emit(data)));
        }

        this.listeners = [];
    }

    emit(data) {
        const promisedData = Promise.resolve(data);
        this.listeners.forEach((each) => each(promisedData));
        return this;
    }

    then(onSuccess, onError) {
        let nextPromiseEmitter = new PromiseEmitter;
        this.listeners.push((data) => process.nextTick(nextPromiseEmitter.emit(data.then(onSuccess, onError))));
        return nextPromiseEmitter;
    }

    catch(onError) {
        return this.then(null, onError);
    }

    when(condition) {
        let nextPromiseEmitter = new PromiseEmitter;
        this.listeners.push((promisedData) => promisedData.then((data) => {
            if (deepCheckCondition(data, condition)) nextPromiseEmitter.emit(data);
        }));
        return nextPromiseEmitter;
    }

    except(condition) {
        let nextPromiseEmitter = new PromiseEmitter;
        this.listeners.push((promisedData) => promisedData.then((data) => {
            if (!deepCheckCondition(data, condition)) nextPromiseEmitter.emit(data);
        }));
        return nextPromiseEmitter;
    }
}
