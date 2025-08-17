import React from 'react';

export const Stage = ({children}: {children?: React.ReactNode}) => <div>{children}</div>;
export const StructureComponent = ({children}: {children?: React.ReactNode}) => <div>{children}</div>;
export const useStage = () => ({}) as any;
export const useComponent = () => ({
  addRepresentation: () => ({}),
  getCenter: () => ({multiplyScalar: () => ({})})
}) as any;
export class Rotation {
  multiplyScalar() { return this; }
}
export class Position {
  multiplyScalar() { return this; }
}
export default {};
