import { Logger, typeFlags } from './utils';
import { isArrayType, isFunctionType, isObjectType, isTupleType } from './checks';
import ts from 'typescript';

export interface PrimitiveTypeDescriptor {
  _type: 'primitive';
  value: ts.Expression;
}

export interface LiteralTypeDescriptor {
  _type: 'literal';
  value: ts.Expression;
}

export interface ArrayTypeDescriptor {
  _type: 'array';
  type: TypeDescriptorReference;
}

export interface TupleTypeDescriptor {
  _type: 'tuple';
  types: TypeDescriptorReference[];
}

export interface ObjectTypePropertyDescriptor {
  _type: 'property';
  accessor: ts.Expression;
  type: TypeDescriptor;
}

export interface ObjectTypeDescriptor {
  _type: 'object';
  constructorName?: string;
  properties: ObjectTypePropertyDescriptor[];
  stringIndexType?: TypeDescriptor;
}

export interface UnionTypeDescriptor {
  _type: 'union';
  types: TypeDescriptor[];
}

export interface IntersectionTypeDescriptor {
  _type: 'intersection';
  types: TypeDescriptor[];
}

export interface UnspecifiedTypeDescriptor {
  _type: 'unspecified';
}

export type TypeDescriptor =
  | PrimitiveTypeDescriptor
  | LiteralTypeDescriptor
  | ObjectTypeDescriptor
  | ArrayTypeDescriptor
  | TupleTypeDescriptor
  | UnionTypeDescriptor
  | IntersectionTypeDescriptor
  | UnspecifiedTypeDescriptor;

// TODO This should also be some sort of identifier by which a TypeDescriptor can be looked up
export type TypeDescriptorReference = TypeDescriptor;

export const describeType = (
  logger: Logger,
  typeChecker: ts.TypeChecker,
  root: ts.TypeNode,
  type: ts.Type,
): TypeDescriptor => {
  const typeName = typeChecker.typeToString(type, root);
  logger('Type', typeName, typeFlags(type).join(', '));

  if (isArrayType(typeChecker, type, root)) {
    logger('\tArray type');

    const elementType = (type as ts.TypeReference).typeArguments?.[0];
    if (!elementType) {
      const errorMessage = `Unable to find array element type for type '${typeName}'. This happened while creating a check for '${root.getText()}'`;

      throw new Error(errorMessage);
    }

    return {
      _type: 'array',
      type: describeType(logger, typeChecker, root, elementType),
    };
  }

  if (type.isClass()) {
    logger('\tClass type');

    return {
      _type: 'object',
      constructorName: typeName,
      properties: [],
    };
  }

  if (type.isLiteral()) {
    logger('\tLiteral type');

    return {
      _type: 'literal',
      value: ts.createLiteral(type.value),
    };
  }

  if (
    type.flags & ts.TypeFlags.BooleanLiteral ||
    type.flags & ts.TypeFlags.Undefined ||
    type.flags & ts.TypeFlags.Null
  ) {
    logger('\ttrue, false, undefined, null');

    return {
      _type: 'literal',
      value: ts.createIdentifier(typeName),
    };
  }

  if (type.flags & ts.TypeFlags.Boolean || type.flags & ts.TypeFlags.Number || type.flags & ts.TypeFlags.String) {
    logger('\tboolean, number, string');

    return {
      _type: 'primitive',
      value: ts.createLiteral(typeName),
    };
  }

  if (type.isUnion()) {
    logger('\tUnion type');

    return {
      _type: 'union',
      types: type.types.map(type => describeType(logger, typeChecker, root, type)),
    };
  }

  if (type.isIntersection()) {
    logger('\tIntersection type');

    return {
      _type: 'intersection',
      types: type.types.map(type => describeType(logger, typeChecker, root, type)),
    };
  }

  if (isFunctionType(typeChecker, type, root)) {
    logger('\tFunction');

    return {
      _type: 'primitive',
      value: ts.createLiteral('function'),
    };
  }

  if (isTupleType(typeChecker, type, root)) {
    logger('\tTuple');

    const types = (type as ts.TupleType).typeArguments || [];

    return {
      _type: 'tuple',
      types: types.map(type => describeType(logger, typeChecker, root, type)),
    };
  }

  if (isObjectType(typeChecker, type, root)) {
    logger('\tObject');

    const properties: ObjectTypePropertyDescriptor[] = type.getProperties().map(property => {
      const propertyType = typeChecker.getTypeOfSymbolAtLocation(property, root);
      const propertyAccessor: ts.Expression =
        ts.isPropertySignature(property.valueDeclaration) && ts.isComputedPropertyName(property.valueDeclaration.name)
          ? property.valueDeclaration.name.expression
          : ts.createStringLiteral(property.name);

      return {
        _type: 'property',
        accessor: propertyAccessor,
        type: describeType(logger, typeChecker, root, propertyType),
      };
    });

    return {
      _type: 'object',
      properties,
    };
  }

  // This one should most probably always be one of the last ones or the last one
  // since it's the most permissive one
  if (type.flags & ts.TypeFlags.Any) {
    logger('\tAny');

    return {
      _type: 'unspecified',
    };
  }

  // Rather than silently failing we throw an exception here to let the people in charge know
  // that this type check is not supported. This might happen if the passed type is e.g. a generic type parameter
  const errorMessage = `Could not create type checker for type '${typeName}'. This happened while creating a check for '${root.getText()}'`;

  throw new Error(errorMessage);
};
