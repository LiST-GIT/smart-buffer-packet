import { PacketContainer } from './index.mjs';
import { SmartBuffer } from 'smart-buffer';

const smartBuffer = SmartBuffer.fromSize( 100 );
const types = new PacketContainer();
types.compile( {
    type: `
        b:uint8
        c:uint8
    `,
    packageName: `
        a1:uint8
        a2:uint8[uint16be]
        a3:type
        // throw new Error( 'test' );
        a4:type[uint16be]
        a5:utf8[uint16be]
    `,
} );
types.packageName.encode( smartBuffer, { a1: 12, a2: [ 2, 54 ], a3: { b: 1, c: 2 }, a4: [ { b:10, c:12 } ], a5: 'abc' } );
console.log( smartBuffer );
console.log( types.packageName.decode( smartBuffer, {} ) );
