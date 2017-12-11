//
//  GTGestureRecognizer.m
//  TrackPad
//
//  Created by Tony Tung on 12/10/17.
//  Copyright © 2017 gesturetag. All rights reserved.
//

#import "GTGestureRecognizer.h"

@implementation GTGestureRecognizer
@synthesize timeThreshold;
@synthesize gestureMode;

-(GTGestureRecognizer *)init {
    self = [super init];
    timeThreshold = 0.2f;
    gestureMode = SWIPE_GESTURE;
    return self;
}

-(SwipeGesture)recognizeGesture:(NSMutableArray *) touchList {
    SwipeGesture gesture = UNKOWN;
    if([touchList count] == 0)
        return gesture;
    float dX = [touchList[[touchList count] - 1] x] - [touchList[0] x];
    float dY = [touchList[[touchList count] - 1] y] - [touchList[0] y];
    NSLog(@"dX: %f, dY: %f", dX, dY);
    if(fabs(dX) - fabs(dY) >= 0.1) {
        // horizontal swipe
        if(dX > 0){
            //swipe right
            gesture = SWIPE_RIGHT;
        } else {
            //swipe left
            gesture = SWIPE_LEFT;
        }
    } else if(fabs(dX) - fabs(dY) <= -0.1){
        //vertical swipe
        if(dY > 0){
            //swipe up
            gesture = SWIPE_UP;
        } else {
            //swipe down
            gesture = SWIPE_DOWN;
        }
    }
    return gesture;
}





@end
