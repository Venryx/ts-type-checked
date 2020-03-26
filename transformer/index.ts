import {
  FunctionExpression,
  Identifier,
  Program,
  PropertyAssignment,
  SourceFile,
  SymbolFlags,
  SyntaxKind,
  TransformationContext,
  TransformerFactory,
  Type,
  TypeFlags,
  TypeNode,
  createBlock,
  createCall,
  createFalse,
  createFunctionExpression,
  createIdentifier,
  createLiteral,
  createLogicalAnd,
  createLogicalOr,
  createNull,
  createParameter,
  createParen,
  createPropertyAccess,
  createPropertyAssignment,
  createReturn,
  createStrictEquality,
  createStrictInequality,
  createStringLiteral,
  createTypeOf,
  isArrayTypeNode,
  isMethodSignature,
  isPropertyDeclaration,
  isPropertySignature,
} from 'typescript';
import { ValueTypeCheckCreator, visitNodeAndChildren } from './visitor';
import { addTypeCheckerMap, createTypeCheckerFunction } from './utils';
import { isInterfaceWithOptionalsCheck } from '../test/e2e/utils';
import ts from 'typescript';

interface TypeCheckMethod {
  name: string;
  definition: FunctionExpression;
}

export default (program: Program): TransformerFactory<SourceFile> => {
  return (context: TransformationContext) => (file: SourceFile) => {
    const typeChecker = program.getTypeChecker();
    const typeCheckerObjectIdentfifier: Identifier = createIdentifier('__typeCheckerMap__');
    const typeCheckMethods: Map<TypeNode, TypeCheckMethod> = new Map();

    // Main type check generator method
    const createTypeCheckMethodDefinition = (typeNode: TypeNode): FunctionExpression => {
      console.warn('typeNode', typeNode.getFullText(), typeNode.kind);

      if (ts.isLiteralTypeNode(typeNode)) {
        console.log('literal type node', typeNode.literal);

        return createTypeCheckerFunction(value => createStrictEquality(value, typeNode.literal));
      }

      if (ts.isTypeLiteralNode(typeNode)) {
        console.log('type literal node');
      }

      if (ts.isTypeReferenceNode(typeNode)) {
        typeNode.typeArguments;
        const type = typeChecker.getTypeFromTypeNode(typeNode);
        const properties = type.getProperties();

        // let type = checker.getTypeAtLocation(node.type);
        // const props = typeChecker.getPropertiesOfType(type);
        // props.forEach(prop => {
        //   const resolvedPropertyType = typeChecker.getTypeOfSymbolAtLocation(prop, undefined as any);
        //   // console.log(resolverPropertyType);
        // });

        properties.forEach(property => {
          const resolvedPropertyType = typeChecker.getTypeOfSymbolAtLocation(property, typeNode);
          console.warn('resolved', resolvedPropertyType);

          const declaration = property.valueDeclaration;
          if (ts.isMethodDeclaration(declaration)) {
            console.warn(
              `When checking methods, ts-type-checked will only check whether method is a function (checking method ${property.getName()} of ${typeNode.getFullText()})`,
            );
          }

          if (ts.isPropertyDeclaration(declaration)) {
            console.log('Property declaration', declaration.getFullText());
          }

          if (ts.isPropertySignature(declaration)) {
            console.log('Property signature', declaration.getFullText(), declaration.type);

            const tc = typeChecker;

            debugger;
          }
          // // TODO Properties without a type, just an initializer
          // if (
          //   !isPropertySignature(declaration) &&
          //   !isMethodSignature(declaration) &&
          //   !isPropertyDeclaration(declaration)
          // ) {
          //   console.warn('declaration', declaration.kind);
          //   throw new Error(`Property ${property.name} does not have a property declaration`);
          // }
          // if (!declaration.type) {
          //   throw new Error(`Could not determine the type of property ${property.name}`);
          // }
          // const type = typeChecker.getTypeFromTypeNode(declaration.type);
          // const propertyAccess = createPropertyAccess(value, property.name);
          // const valueTypeCheck = createValueTypeCheck(type, propertyAccess);
          // const isOptional = property.getFlags() & SymbolFlags.Optional;
          // if (!isOptional) {
          //   return createLogicalAnd(expression, valueTypeCheck);
          // }
          // const optionalCheck = createStrictEquality(createTypeOf(propertyAccess), createStringLiteral('undefined'));
          // return createLogicalAnd(expression, createParen(createLogicalOr(optionalCheck, valueTypeCheck)));
        });

        debugger;
      }

      return createTypeCheckerFunction(() => createFalse());

      // if (type.flags & TypeFlags.Boolean) {
      //   return createTypeCheckerFunction(value =>
      //     createStrictEquality(createTypeOf(value), createStringLiteral('boolean')),
      //   );
      // }

      // if (type.flags & TypeFlags.BooleanLiteral) {
      //   const typeNode = typeChecker.typeToTypeNode(type);

      //   return createTypeCheckerFunction(value =>
      //     createStrictEquality(value, createLiteral(typeNode?.kind === SyntaxKind.TrueKeyword)),
      //   );
      // }

      // if (type.flags & TypeFlags.Number) {
      //   return createTypeCheckerFunction(value =>
      //     createStrictEquality(createTypeOf(value), createStringLiteral('number')),
      //   );
      // }

      // if (type.flags & TypeFlags.String) {
      //   return createTypeCheckerFunction(value =>
      //     createStrictEquality(createTypeOf(value), createStringLiteral('string')),
      //   );
      // }

      // if (type.flags & TypeFlags.Undefined) {
      //   return createTypeCheckerFunction(value =>
      //     createStrictEquality(createTypeOf(value), createStringLiteral('undefined')),
      //   );
      // }

      // if (type.isLiteral()) {
      //   return createTypeCheckerFunction(value => createStrictEquality(value, createLiteral(type.value)));
      // }

      // if (type.isUnion()) {
      //   return createTypeCheckerFunction(value => {
      //     return type.types
      //       .map(unionMemberType => {
      //         return createValueTypeCheck(unionMemberType, value);
      //       })
      //       .reduce((expression, unionMemberExpression) => createLogicalOr(expression, unionMemberExpression));
      //   });
      // }

      // // const typeNode = typeChecker.typeToTypeNode(type);
      // if (typeNode && isArrayTypeNode(typeNode)) {
      //   const indexType = type.getNumberIndexType();
      //   if (!indexType) {
      //     throw new Error('Could not find array type for ' + typeNode.getFullText());
      //   }

      //   return createTypeCheckerFunction(value => {
      //     const isArray = createCall(createPropertyAccess(createIdentifier('Array'), 'isArray'), [], [value]);
      //     const element = createIdentifier('element');
      //     const checkElement = createFunctionExpression(
      //       undefined,
      //       undefined,
      //       undefined,
      //       undefined,
      //       [
      //         createParameter(
      //           /* decorators */ undefined,
      //           /* modifiers */ undefined,
      //           /* dotDotDotToken */ undefined,
      //           /* name */ element,
      //           undefined,
      //           undefined,
      //           undefined,
      //         ),
      //       ],
      //       undefined,
      //       createBlock([createReturn(createValueTypeCheck(indexType, element))], false),
      //     );
      //     const checkElements = createCall(createPropertyAccess(value, 'every'), [], [checkElement]);

      //     return createLogicalAnd(isArray, checkElements);
      //   });
      // }

      // return createTypeCheckerFunction(value => {
      //   const isObject = createLogicalAnd(
      //     createStrictEquality(createTypeOf(value), createStringLiteral('object')),
      //     createStrictInequality(value, createNull()),
      //   );

      //   return type.getProperties().reduce((expression, property) => {
      //     const declaration = property.valueDeclaration;
      //     // TODO Properties without a type, just an initializer
      //     if (
      //       !isPropertySignature(declaration) &&
      //       !isMethodSignature(declaration) &&
      //       !isPropertyDeclaration(declaration)
      //     ) {
      //       console.warn('declaration', declaration.kind);

      //       throw new Error(`Property ${property.name} does not have a property declaration`);
      //     }

      //     if (!declaration.type) {
      //       throw new Error(`Could not determine the type of property ${property.name}`);
      //     }

      //     const type = typeChecker.getTypeFromTypeNode(declaration.type);
      //     const propertyAccess = createPropertyAccess(value, property.name);
      //     const valueTypeCheck = createValueTypeCheck(type, propertyAccess);
      //     const isOptional = property.getFlags() & SymbolFlags.Optional;
      //     if (!isOptional) {
      //       return createLogicalAnd(expression, valueTypeCheck);
      //     }

      //     const optionalCheck = createStrictEquality(createTypeOf(propertyAccess), createStringLiteral('undefined'));
      //     return createLogicalAnd(expression, createParen(createLogicalOr(optionalCheck, valueTypeCheck)));
      //   }, isObject);
      // });
    };

    let lastMethodId = 0;
    const createTypeCheckMethod = (typeNode: TypeNode): TypeCheckMethod => {
      const name = `__${lastMethodId++}`;
      const defaultMethod = { name, definition: undefined };

      // FIXME We first need to mark this node, then create its definition to prevent recursion
      typeCheckMethods.set(typeNode, defaultMethod as any);

      const definition = createTypeCheckMethodDefinition(typeNode);
      const method = { name, definition };
      typeCheckMethods.set(typeNode, method);

      return method;
    };

    const createValueTypeCheck: ValueTypeCheckCreator = (typeNode, value) => {
      if (
        typeNode.kind === ts.SyntaxKind.StringKeyword ||
        typeNode.kind === ts.SyntaxKind.NumberKeyword ||
        typeNode.kind === ts.SyntaxKind.BooleanKeyword ||
        typeNode.kind === ts.SyntaxKind.UndefinedKeyword
      ) {
        console.log('typeof kinda keyword', typeNode.getText());

        return createStrictEquality(createTypeOf(value), createStringLiteral(typeNode.getText()));
      }

      if (ts.isLiteralTypeNode(typeNode)) {
        console.log('literal type node', typeNode.literal);

        return createStrictEquality(value, typeNode.literal);
      }

      const method = typeCheckMethods.get(typeNode) || createTypeCheckMethod(typeNode);

      return createCall(
        createPropertyAccess(typeCheckerObjectIdentfifier, method.name),
        /* typeArguments */ undefined,
        /* arguments */ [value],
      );
    };

    const transformedFile = visitNodeAndChildren(file, program, context, createValueTypeCheck);
    const typeCheckerProperties: PropertyAssignment[] = Array.from(typeCheckMethods.values()).map(method => {
      return createPropertyAssignment(method.name, method.definition);
    });
    const transformedFileWithTypeCheckerMap = addTypeCheckerMap(
      transformedFile,
      typeCheckerObjectIdentfifier,
      typeCheckerProperties,
    );

    return transformedFileWithTypeCheckerMap;
  };
};
