import {render} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import CameraController from './camera-controller';

vi.mock('../select', () => ({default: ({onChange, options, value}: any) => (
  <select data-testid="select" onChange={e => onChange({value: e.target.value})} value={value?.value}>
    {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
)}));
vi.mock('../button', () => ({
  default: ({children, btnStyle, btnSize, btnHeight, ...props}: any) => (
    // filter styling props to avoid React DOM warnings
    <button {...props}>{children}</button>
  )
}));
vi.mock('../../utils/download', () => ({makeDownload: vi.fn()}));
vi.mock('../../utils/use-mounted', () => ({default: () => () => true}));

vi.mock('react-ngl', () => ({
  useStage: () => ({viewer: {getImage: () => Promise.resolve(new Blob())}}),
  useComponent: () => ({
    getCenter: () => ({multiplyScalar: () => ({x:0,y:0,z:0, clone(){return this;}}), clone(){return this;}}),
    getZoom: () => 0,
    getBox: () => ({
      min: {multiplyScalar: () => ({x:0,y:0,z:0})},
      max: {multiplyScalar: () => ({x:0,y:0,z:0})}
    })
  }),
  Position: class {constructor(...args:any[]){ } clone(){return this;}},
  Rotation: class {constructor(...args:any[]){ } clone(){return this;}}
}));

describe('CameraController', () => {
  it('renders control buttons', () => {
    const views = [{name: 'view1', pdb: '1abc'}];
    const {getByText} = render(
      <CameraController
        pdb="1abc"
        views={views}
        currentViewName="view1"
        setView={() => {}}
        setCameraState={() => {}}
      />
    );
    expect(getByText('Save image')).toBeInTheDocument();
  });
});

