import { AbiParameter, CodegenConfig, EventArgDeclaration, FunctionDeclaration } from 'typechain';
interface GenerateFunctionOptions {
    returnResultObject?: boolean;
    isStaticCall?: boolean;
    overrideOutput?: string;
    codegenConfig: CodegenConfig;
}
export declare function codegenFunctions(options: GenerateFunctionOptions, fns: FunctionDeclaration[]): string;
export declare function codegenForOverloadedFunctions(options: GenerateFunctionOptions, fns: FunctionDeclaration[]): string;
export declare function generateInterfaceFunctionDescription(fn: FunctionDeclaration): string;
export declare function generateEncodeFunctionDataOverload(fn: FunctionDeclaration): string;
export declare function generateDecodeFunctionResultOverload(fn: FunctionDeclaration): string;
export declare function generateParamNames(params: Array<AbiParameter | EventArgDeclaration>): string;
export {};
