import { WrappedComponent, Dict, BaseComponentProps, AnyComponent, BaseRegistration } from 'piral-core';
import { ComponentType } from 'react';

declare module 'piral-core/lib/types/custom' {

  interface PiletCustomApi extends PiletDockApi {}

  interface PiralCustomActions {}
}

export interface PiletDockApi {
}