import util from 'util';

export class Packet {
    types = null;
    constructor ( types ) { this.types = types; }
    encode ( buffer, value ) { throw new Error( 'method not implemented' ); }
    decode ( buffer ) { throw new Error( 'method not implemented' ); }
}

export class PacketContainer {
    compile ( table ) {
        for ( const name in table ) {
            const pseudoCode = table[ name ];
            const encode = new Function( 'buffer', 'value', [
                util.format( 'const [ isEncode, isDecode ] = [ true, false ];' ),
                util.format( 'try {' ),
                pseudoCode.replace( /^(\s+)(.+?):(.+?)(\[(.+?)\]|)$/mg, ( all, white, name, type, none, sizeType ) => {
                    if ( sizeType ) {
                        return [
                            util.format( '%s{', white ),
                            util.format( '%s    let temp = value.%s ?? [];', white, name ),
                            ...( type === 'utf8' ? [
                                util.format( '%s    temp = Buffer.from( temp );', white ),
                            ] : [
                            ] ),
                            util.format( '%s    const size = temp.length ?? 0;', white ),
                            util.format( '%s    this.types.%s.encode( buffer, size );', white, sizeType ),
                            ...( type === 'int8' || type === 'uint8' ? [
                                util.format( '%s    buffer.writeBuffer( Buffer.from( temp ) );', white ),
                            ] : type === 'utf8' ? [
                                util.format( '%s    buffer.writeBuffer( temp );', white ),
                            ] : [
                                util.format( '%s    for ( let index = 0; index < size; index++ ) {', white ),
                                util.format( '%s        this.types.%s.encode( buffer, value.%s[ index ] );', white, type, name ),
                                util.format( '%s    }', white ),
                            ] ),
                            util.format( '%s}', white ),
                        ].join( '\n' );
                    } else {
                        return util.format( '%sthis.types.%s.encode( buffer, value.%s );', white, type, name );
                    }
                } ),
                util.format( '} catch ( error ) {' ),
                util.format( '    error.reason = this.encode.toString();' ),
                util.format( '    throw error;' ),
                util.format( '}' ),
                util.format( 'return buffer;' ),
            ].join( '\n' ) );
            const decode = new Function( 'buffer', [
                util.format( 'const [ isEncode, isDecode ] = [ false, true ];' ),
                util.format( 'let value = {};' ),
                util.format( 'try {' ),
                pseudoCode.replace( /^(\s+)(.+?):(.+?)(\[(.+?)\]|)$/mg, ( all, white, name, type, none, sizeType ) => {
                    if ( sizeType ) {
                        return [
                            util.format( '%s{', white ),
                            util.format( '%s    const size = this.types.%s.decode( buffer );', white, sizeType ),
                            ...( type === 'uint8' ? [
                                util.format( '%s    value.%s = buffer.readBuffer( size );', white, name ),
                            ] : type === 'utf8' ? [
                                util.format( '%s    value.%s = buffer.readString( size );', white, name ),
                            ] : [
                                util.format( '%s    value.%s = [];', white, name ),
                                util.format( '%s    for ( let index = 0; index < size; index++ ) {', white ),
                                util.format( '%s        value.%s[ index ] = this.types.%s.decode( buffer );', white, name, type ),
                                util.format( '%s    }', white ),
                            ] ),
                            util.format( '%s}', white ),
                        ].join( '\n' );
                    } else {
                        return util.format( '%svalue.%s = this.types.%s.decode( buffer );', white, name, type );
                    }
                } ),
                util.format( '} catch ( error ) {' ),
                util.format( '    error.reason = this.decode.toString();' ),
                util.format( '    throw error;' ),
                util.format( '}' ),
                util.format( 'return value;' ),
            ].join( '\n' ) );
            this[ name ] = new ( { [ name ]: class extends Packet { encode = encode; decode = decode; } } )[ name ]( this );
        }
        return this;
    }
    int8 = new class Packet { encode = ( buffer, value ) => buffer.writeInt8( value ); decode = ( buffer ) => buffer.readInt8() };
    uint8 = new class Packet { encode = ( buffer, value ) => buffer.writeUInt8( value ); decode = ( buffer ) => buffer.readUInt8() };
    int16le = new class Packet { encode = ( buffer, value ) => buffer.writeInt16LE( value ); decode = ( buffer ) => buffer.readInt16LE() };
    int16be = new class Packet { encode = ( buffer, value ) => buffer.writeInt16BE( value ); decode = ( buffer ) => buffer.readInt16BE() };
    uint16le = new class Packet { encode = ( buffer, value ) => buffer.writeUInt16LE( value ); decode = ( buffer ) => buffer.readUInt16LE() };
    uint16be = new class Packet { encode = ( buffer, value ) => buffer.writeUInt16BE( value ); decode = ( buffer ) => buffer.readUInt16BE() };
    int32le = new class Packet { encode = ( buffer, value ) => buffer.writeInt32LE( value ); decode = ( buffer ) => buffer.readInt32LE() };
    int32be = new class Packet { encode = ( buffer, value ) => buffer.writeInt32BE( value ); decode = ( buffer ) => buffer.readInt32BE() };
    uint32le = new class Packet { encode = ( buffer, value ) => buffer.writeUInt32LE( value ); decode = ( buffer ) => buffer.readUInt32LE() };
    uint32be = new class Packet { encode = ( buffer, value ) => buffer.writeUInt32BE( value ); decode = ( buffer ) => buffer.readUInt32BE() };
    int64le = new class Packet { encode = ( buffer, value ) => buffer.writeInt64LE( value ); decode = ( buffer ) => buffer.readInt64LE() };
    int64be = new class Packet { encode = ( buffer, value ) => buffer.writeInt64BE( value ); decode = ( buffer ) => buffer.readInt64BE() };
    uint64le = new class Packet { encode = ( buffer, value ) => buffer.writeUInt64LE( value ); decode = ( buffer ) => buffer.readUInt64LE() };
    uint64be = new class Packet { encode = ( buffer, value ) => buffer.writeUInt64BE( value ); decode = ( buffer ) => buffer.readUInt64BE() };
    floatle = new class Packet { encode = ( buffer, value ) => buffer.writeFloatLE( value ); decode = ( buffer ) => buffer.readFloatLE() };
    floatbe = new class Packet { encode = ( buffer, value ) => buffer.writeFloatBE( value ); decode = ( buffer ) => buffer.readFloatBE() };
    doublele = new class Packet { encode = ( buffer, value ) => buffer.writeDoubleLE( value ); decode = ( buffer ) => buffer.readDoubleLE() };
    doublebe = new class Packet { encode = ( buffer, value ) => buffer.writeDoubleBE( value ); decode = ( buffer ) => buffer.readDoubleBE() };
}
