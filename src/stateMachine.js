// THIS IS A TEMPLATE ... Not something to import

const Tracer = require('./tracer');

class State
{
    constructor(previous)
    {
        if (previous) {
            this.count = previous.count;

        } else {
            this.count = 1;
        }
        this.$key = undefined;
    }

    merge(other) 
    {
        this.count += other.count;
    }

    clone() 
    {
        return new State(this);
    }

    get key() 
    { 
        if (this.$key === undefined) {
            this.$key = /* generate the key */
        }
        return this.$key;
    }

    nextStates(callback)
    {
        throw "Not implemented";
    }
}

class StateMachine
{
    constructor(trace)
    {
        this.states     = new Map();
        this.newStates  = new Map();
        this.Tracer     = new Tracer(trace);
    }

    trace() 
    {
        this.tracer.print(_ => this.states.size);
    }

    get result()
    {
        throw "Not implemented";
    }

    setInitialState()
    {
        const state = new State();

        this.states.set(state.key, state);
    }

    run()
    {
        this.setInitialState();

        while (this.states.size > 0) {    

            this.trace();
            this.newStates.clear();

            for(const state of this.states.values()) 
            {
                state.nextStates(newState => 
                {
                    let old = this.newStates.get(newState.key);
                    if (old) {
                        old.merge(newState);
                    } else {
                        this.newStates.set(newState.key, newState);
                    }
                });
            }

            [this.states, this.newStates] = [this.newStates, this.states];
        }

        this.newStates.clear();
        return this; 
    }
}
