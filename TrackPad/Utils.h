//
//  Utils.h
//  TrackPad
//
//  Created by Tony Tung on 12/10/17.
//  Copyright © 2017 gesturetag. All rights reserved.
//

#ifndef Utils_h
#define Utils_h

typedef enum GestureMode : NSInteger
{
    SWIPE_GESTURE,
    PRESS_GESTURE
} GestureMode;

typedef enum SwipeGesture
{
    SWIPE_RIGHT,
    SWIPE_LEFT,
    SWIPE_UP,
    SWIPE_DOWN,
    UNKOWN
} SwipeGesture;
#endif /* Utils_h */
