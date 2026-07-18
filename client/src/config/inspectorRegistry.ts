import React from 'react';
import type { InspectorProps } from '../types/inspector';
import { ButtonInspector } from '../builder/inspectors/ButtonInspector';
import { TextInspector } from '../builder/inspectors/TextInspector';

export const InspectorRegistry: Record<string, React.FC<InspectorProps>> = {
    'btn': ButtonInspector,
    'text': TextInspector,
    'trackpad': () => null,
};