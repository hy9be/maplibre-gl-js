import type Point from '@mapbox/point-geometry';

import {DOM} from '../../util/dom';
import {DragMoveHandler, DragPanResult, DragRotateResult, DragPitchResult, DragHandler, DragRollResult} from './drag_handler';
import {MouseMoveStateManager} from './drag_move_state_manager';

/**
 * `MousePanHandler` allows the user to pan the map by clicking and dragging
 */
export interface MousePanHandler extends DragMoveHandler<DragPanResult, MouseEvent> {}
/**
 * `MouseRotateHandler` allows the user to rotate the map by clicking and dragging
 */
export interface MouseRotateHandler extends DragMoveHandler<DragRotateResult, MouseEvent> {}
/**
 * `MousePitchHandler` allows the user to zoom the map by pitching
 */
export interface MousePitchHandler extends DragMoveHandler<DragPitchResult, MouseEvent> {}
/**
 * `MouseRollHandler` allows the user to roll the camera by holding `Ctrl`, right-clicking and dragging
 */
export interface MouseRollHandler extends DragMoveHandler<DragRollResult, MouseEvent> {}

const LEFT_BUTTON = 0;
const RIGHT_BUTTON = 2;

const assignEvents = (handler: DragHandler<DragPanResult, MouseEvent>) => {
    handler.mousedown = handler.dragStart;
    handler.mousemoveWindow = handler.dragMove;
    handler.mouseup = handler.dragEnd;
    handler.contextmenu = (e: MouseEvent) => {
        e.preventDefault();
    };
};

export const generateMousePanHandler = ({enable, clickTolerance,}: {
    clickTolerance: number;
    enable?: boolean;
}): MousePanHandler => {
    const mouseMoveStateManager = new MouseMoveStateManager({
        checkCorrectEvent: (e: MouseEvent) => DOM.mouseButton(e) === LEFT_BUTTON && !e.ctrlKey,
    });
    return new DragHandler<DragPanResult, MouseEvent>({
        clickTolerance,
        move: (lastPoint: Point, point: Point) =>
            ({around: point, panDelta: point.sub(lastPoint)}),
        activateOnStart: true,
        moveStateManager: mouseMoveStateManager,
        enable,
        assignEvents,
    });
};

export const generateMouseRotationHandler = ({enable, clickTolerance, bearingDegreesPerPixelMoved = 0.8}: {
    clickTolerance: number;
    bearingDegreesPerPixelMoved?: number;
    enable?: boolean;
}): MouseRotateHandler => {
    const mouseMoveStateManager = new MouseMoveStateManager({
        checkCorrectEvent: (e: MouseEvent): boolean =>
            (DOM.mouseButton(e) === LEFT_BUTTON && e.ctrlKey) ||
            (DOM.mouseButton(e) === RIGHT_BUTTON && !e.ctrlKey),
    });
    return new DragHandler<DragRotateResult, MouseEvent>({
        clickTolerance,
        move: (lastPoint: Point, point: Point) =>
            ({bearingDelta: (point.x - lastPoint.x) * bearingDegreesPerPixelMoved}),
        // prevent browser context menu when necessary; we don't allow it with rotation
        // because we can't discern rotation gesture start from contextmenu on Mac
        moveStateManager: mouseMoveStateManager,
        enable,
        assignEvents,
    });
};

export const generateMousePitchHandler = ({enable, clickTolerance, pitchDegreesPerPixelMoved = -0.5}: {
    clickTolerance: number;
    pitchDegreesPerPixelMoved?: number;
    enable?: boolean;
}): MousePitchHandler => {
    const mouseMoveStateManager = new MouseMoveStateManager({
        checkCorrectEvent: (e: MouseEvent): boolean =>
            (DOM.mouseButton(e) === LEFT_BUTTON && e.ctrlKey) ||
            (DOM.mouseButton(e) === RIGHT_BUTTON),
    });
    return new DragHandler<DragPitchResult, MouseEvent>({
        clickTolerance,
        move: (lastPoint: Point, point: Point) =>
            ({pitchDelta: (point.y - lastPoint.y) * pitchDegreesPerPixelMoved}),
        // prevent browser context menu when necessary; we don't allow it with rotation
        // because we can't discern rotation gesture start from contextmenu on Mac
        moveStateManager: mouseMoveStateManager,
        enable,
        assignEvents,
    });
};

export const generateMouseRollHandler = ({enable, clickTolerance, rollDegreesPerPixelMoved = 0.8}: {
    clickTolerance: number;
    rollDegreesPerPixelMoved?: number;
    enable?: boolean;
}): MouseRollHandler => {
    const mouseMoveStateManager = new MouseMoveStateManager({
        checkCorrectEvent: (e: MouseEvent): boolean =>
            (DOM.mouseButton(e) === RIGHT_BUTTON && e.ctrlKey),
    });
    return new DragHandler<DragRollResult, MouseEvent>({
        clickTolerance,
        move: (lastPoint: Point, point: Point) =>
            ({rollDelta: (point.x - lastPoint.x) * rollDegreesPerPixelMoved}),
        // prevent browser context menu when necessary; we don't allow it with roll
        // because we can't discern roll gesture start from contextmenu on Mac
        moveStateManager: mouseMoveStateManager,
        enable,
        assignEvents,
    });
};
