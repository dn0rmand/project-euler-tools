const { gotoSOL, eraseLine, back } = require('console-control-strings');
const prettyHrtime = require('atlas-pretty-hrtime');
const assert = require('assert');

class Tracer
{
    static create(enabled, prefix)
    {
        if (enabled) {
            return new Tracer(enabled, prefix);
        }
    }

    constructor(enabled, prefix)
    {
        this.enabled    = enabled;
        this.prefix     = prefix;
        this.lastLength = 0;
        this.lastString = '';
        this.start      = undefined;
        this.remaining  = undefined;
        this.executed   = undefined;
        this.estimated  = undefined;
        this.lastPrint  = undefined;
    }

    get prefix() 
    { 
        return this.$prefix; 
    }

    set prefix(value)
    {
        this.clear(false);
        this.$prefix = value || '';

        if (this.$prefix && this.enabled) {
            process.stdout.write(` ${ this.$prefix} `);
            this.lastPrint = undefined;
        }
    }

    clear(excludePrefix)
    {
        if (this.enabled)
        {
            let length = this.lastLength;
            
            if (!excludePrefix && this.prefix)
                length += this.prefix.length+2;

            if (length)
            {
                process.stdout.write(back(length));
                process.stdout.write(eraseLine());
            }

            if (! excludePrefix) {
                this.lastPrint = undefined;
            }
        }
    }

    setRemaining(remaining)
    {
        assert.notStrictEqual(remaining, undefined);

        remaining = BigInt(remaining);

        if (this.remaining === undefined) {
            this.remaining = remaining;
            this.start     = process.hrtime.bigint();
            this.executed  = 0n;
        }
        else {
            this.executed  += this.remaining - remaining;
            this.remaining  = remaining;
            const spend     = process.hrtime.bigint() - this.start;
            
            this.estimated  = Number((spend * remaining) / this.executed);
        }
    }

    get shouldPrint() 
    {
        if (! this.enabled) 
        {
            return false;
        }

        const now = Date.now();

        if (this.lastPrint === undefined || (now - this.lastPrint) >= 1000) 
        {
            this.lastPrint = now;
            return true;
        }

        return false;
    }

    print(callback)
    {
        if (this.shouldPrint)
        {
            let str = ` ${callback()} `;
            if (str !== this.lastString) {
                this.clear(true);
                if (this.estimated !== undefined)
                { 
                    str += ` - estimated time ${ prettyHrtime(this.estimated, 2) }`;
                }
                process.stdout.write(str);
                this.lastLength = str.length;
                this.lastString = str;
            }
        }
    }
}

module.exports = Tracer;