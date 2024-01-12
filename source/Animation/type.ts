export type PositionY = 'Top' | 'Bottom';
export type DirectionX = 'Left' | 'Right';
export type DirectionY = 'Up' | 'Down';
export type Direction = DirectionX | DirectionY;
export type AnimationMode = 'In' | 'Out';

export type AttentionSeekers =
    | 'bounce'
    | 'flash'
    | 'pulse'
    | 'rubberBand'
    | `shake${'X' | 'Y'}`
    | 'headShake'
    | 'swing'
    | 'tada'
    | 'wobble'
    | 'jello'
    | 'heartBeat';
export type BackEntrances = `backIn${Direction}`;
export type BackExits = `backOut${Direction}`;
export type BouncingEntrances = `bounceIn${'' | Direction}`;
export type BouncingExits = `bounceOut${'' | Direction}`;
export type FadingEntrances =
    | `fadeIn${'' | `${Direction}${'' | 'Big'}`}`
    | `fadeIn${PositionY}${DirectionX}`;
export type FadingExits = `fadeOut${
    | ''
    | `${Direction}${'' | 'Big'}`
    | `${PositionY}${DirectionX}`}`;
export type Flippers = `flip${'' | `${AnimationMode}${'X' | 'Y'}`}`;
export type Lightspeed = `lightSpeed${AnimationMode}${DirectionX}`;
export type RotatingEntrances = `rotateIn${'' | `${DirectionY}${DirectionX}`}`;
export type RotatingExits = `rotateOut${'' | `${DirectionY}${DirectionX}`}`;
export type Specials = 'hinge' | 'jackInTheBox' | `roll${'In' | 'Out'}`;
export type ZoomingEntrances = `zoomIn${'' | Direction}`;
export type ZoomingExits = `zoomOut${'' | Direction}`;
export type SlidingEntrances = `slideIn${Direction}`;
export type SlidingExits = `slideOut${Direction}`;

export type AnimationType =
    | AttentionSeekers
    | BackEntrances
    | BackExits
    | BouncingEntrances
    | BouncingExits
    | FadingEntrances
    | FadingExits
    | Flippers
    | Lightspeed
    | RotatingEntrances
    | RotatingExits
    | Specials
    | ZoomingEntrances
    | ZoomingExits
    | SlidingEntrances
    | SlidingExits;
