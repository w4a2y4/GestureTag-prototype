//
//  TouchPoint.m
//  FingerMgmt
//
//  Created by Johan Nordberg on 2009-11-06.
//  Copyright 2009 FFFF00 Agents AB. All rights reserved.
//

#import "TouchPoint.h"

@implementation TouchPoint

@synthesize x, y;
@synthesize velX, velY;
@synthesize minorAxis;
@synthesize majorAxis;
@synthesize angle;
@synthesize size;
@synthesize timestamp;
@synthesize fingerId;
@synthesize pathIndex;
@synthesize dX;
@synthesize dY;

- (id)initWithTouch:(MTTouch *)touch {
  if ((self = [self init])) {
    x = touch->normalizedVector.position.x;
    y = touch->normalizedVector.position.y;
    minorAxis = touch->minorAxis;
    majorAxis = touch->majorAxis;
    angle = touch->angle;
    size = touch->zTotal;
    velX = touch->normalizedVector.velocity.x;
    velY = touch->normalizedVector.velocity.y;
    timestamp = touch->timestamp;
    fingerId = touch->fingerID;
      pathIndex = touch->pathIndex;
      dX = 0.0f;
      dY = 0.0f;
  }
  return self;
}

@end
