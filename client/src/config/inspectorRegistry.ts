import React from 'react';
import type { InspectorProps } from '../types/inspector';
import { ButtonInspector } from '../builder/inspectors/ButtonInspector';
import { TextInspector } from '../builder/inspectors/TextInspector';
import { MacroInspector } from '../builder/inspectors/MacroInspector';

export const InspectorRegistry: Record<string, React.FC<InspectorProps>> = {
    'btn': ButtonInspector,
    'text': TextInspector,
    'macro': MacroInspector, 
    'trackpad': () => null,
};