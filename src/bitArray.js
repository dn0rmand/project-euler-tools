"use strict"

module.exports = function(size)
{
    size   = Math.ceil(size / 8)
    let buffer = new Uint8Array(size);

    let result = {
        set: function(index, bool) {
            var pos = index >>> 3
            if(bool) {
                buffer[pos] |= 1 << (index % 8)
            } else {
                buffer[pos] &= ~(1 << (index % 8))
            }
        },
        get: function(index) {
            return (buffer[index >>> 3] & (1 << (index % 8))) != 0
        }
    };

    return result;
}
