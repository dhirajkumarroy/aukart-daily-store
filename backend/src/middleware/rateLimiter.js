import rateLimit from 'express-rate-limit';

export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

export const clickLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 redirect clicks per minute to prevent click bot abuse
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many click redirects initiated, please wait'
  }
});
