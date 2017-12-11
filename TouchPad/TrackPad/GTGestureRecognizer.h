//
//  GTGestureRecognizer.h
//  TrackPad
//
//  Created by Tony Tung on 12/10/17.
//  Copyright © 2017 gesturetag. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "TouchPoint.h"
#import "Utils.h"
@interface GTGestureRecognizer : NSObject

//typedef enum RecognitionState : NSInteger
//{
//    NO_TOUCH_STATE,
//    START_STATE,
//    CHANGE_STATE,
//    TIMEOUT_STATE,
//    END_STATE
//} RecognitionState;
@property GestureMode gestureMode;
@property float timeThreshold;
@property NSMutableArray *points;
//@property enum RecognitionState currentState;
-(SwipeGesture)recognizeGesture:(NSMutableArray *)touchList;
@end
