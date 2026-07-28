import React, { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import fleurDeLisTufting from '../../assets/flor-de-lis-tufting.webp';
import { cn } from '../../utils/cn';

type FleurDeLisRevealProps = {
  className?: string;
  label?: string;
};

type RevealPath = {
  d: string;
  width: number;
  delay: number;
  duration: number;
  clip?: 'top' | 'left' | 'right' | 'lower-left' | 'lower-right' | 'lower-center';
};

const VIEWBOX = '0 0 474 512';

const yellowReveal: RevealPath[] = [
  { d: 'M237 330 C237 282 237 216 237 160', width: 42, delay: 0, duration: 1.15 },
  { d: 'M237 335 C211 335 188 335 166 335', width: 36, delay: 0.08, duration: 0.9 },
  { d: 'M237 335 C263 335 286 335 308 335', width: 36, delay: 0.08, duration: 0.9 },
  { d: 'M237 345 C237 380 237 417 237 452', width: 38, delay: 0.12, duration: 1.05 },
];

const innerOrangeReveal: RevealPath[] = [
  { d: 'M237 316 C231 273 229 217 237 108', width: 82, delay: 0.82, duration: 1.35 },
  { d: 'M237 354 C237 390 237 432 237 470', width: 72, delay: 0.94, duration: 1.18 },
];

const ivoryReveal: RevealPath[] = [
  { d: 'M222 315 C219 286 215 260 212 235 C208 201 205 169 211 143 C216 120 226 101 237 90', width: 28, delay: 1.8, duration: 1.35 },
  { d: 'M252 315 C255 286 259 260 262 235 C266 201 269 169 263 143 C258 120 248 101 237 90', width: 28, delay: 1.8, duration: 1.35 },
  { d: 'M76 301 C67 286 67 268 79 254 C95 235 123 233 144 247 C163 260 173 281 180 301', width: 24, delay: 3.28, duration: 1.1 },
  { d: 'M398 301 C407 286 407 268 395 254 C379 235 351 233 330 247 C311 260 301 281 294 301', width: 24, delay: 3.28, duration: 1.1 },
  { d: 'M197 357 C195 376 190 395 183 409', width: 21, delay: 3.52, duration: 0.72 },
  { d: 'M277 357 C279 376 284 395 291 409', width: 21, delay: 3.52, duration: 0.72 },
];

const outerOrangeReveal: RevealPath[] = [
  { d: 'M237 310 C210 278 190 236 186 189 C181 126 201 65 237 24', width: 94, delay: 2.85, duration: 1.65, clip: 'top' },
  { d: 'M237 310 C264 278 284 236 288 189 C293 126 273 65 237 24', width: 94, delay: 2.85, duration: 1.65, clip: 'top' },
  { d: 'M116 255 C90 233 61 238 48 258 C35 279 51 302 74 314 C101 329 135 322 157 303 C178 285 181 259 168 235 C154 210 126 192 93 195 C64 198 40 220 40 250 C40 280 62 306 99 318 C130 329 161 319 188 303 C169 302 148 309 132 313 C114 317 97 309 91 297 C85 285 92 271 106 265 C119 260 133 267 135 278 C137 289 130 298 119 301', width: 104, delay: 3.02, duration: 2.05, clip: 'left' },
  { d: 'M358 255 C384 233 413 238 426 258 C439 279 423 302 400 314 C373 329 339 322 317 303 C296 285 293 259 306 235 C320 210 348 192 381 195 C410 198 434 220 434 250 C434 280 412 306 375 318 C344 329 313 319 286 303 C305 302 326 309 342 313 C360 317 377 309 383 297 C389 285 382 271 368 265 C355 260 341 267 339 278 C337 289 344 298 355 301', width: 104, delay: 3.02, duration: 2.05, clip: 'right' },
  { d: 'M141 393 C127 395 115 387 112 374 C109 362 117 354 130 353 C145 352 155 361 156 374 C157 389 148 403 135 412 C123 420 109 417 103 406 C97 395 101 382 111 374 C124 365 139 369 145 380 C151 391 145 405 133 411 C153 424 178 410 190 392 C198 380 201 368 199 356', width: 58, delay: 3.38, duration: 1.35, clip: 'lower-left' },
  { d: 'M333 393 C347 395 359 387 362 374 C365 362 357 354 344 353 C329 352 319 361 318 374 C317 389 326 403 339 412 C351 420 365 417 371 406 C377 395 373 382 363 374 C350 365 335 369 329 380 C323 391 329 405 341 411 C321 424 296 410 284 392 C276 380 273 368 275 356', width: 58, delay: 3.38, duration: 1.35, clip: 'lower-right' },
  { d: 'M237 356 C237 399 237 454 237 497', width: 84, delay: 3.45, duration: 1.4, clip: 'lower-center' },
];

const brownReveal: RevealPath[] = [
  { d: 'M237 336 C207 336 178 336 151 336', width: 58, delay: 4.86, duration: 0.85 },
  { d: 'M237 336 C267 336 296 336 323 336', width: 58, delay: 4.86, duration: 0.85 },
  { d: 'M195 318 C178 278 160 232 158 185 C155 114 181 48 237 7', width: 42, delay: 4.98, duration: 1.42 },
  { d: 'M279 318 C296 278 314 232 316 185 C319 114 293 48 237 7', width: 42, delay: 4.98, duration: 1.42 },
  { d: 'M194 318 C161 327 137 341 101 337 C57 333 20 307 8 270 C-3 233 13 199 45 180 C80 160 122 169 153 192 C184 216 198 252 189 284 C182 307 163 324 139 331', width: 44, delay: 5.08, duration: 1.55 },
  { d: 'M280 318 C313 327 337 341 373 337 C417 333 454 307 466 270 C477 233 461 199 429 180 C394 160 352 169 321 192 C290 216 276 252 285 284 C292 307 311 324 335 331', width: 44, delay: 5.08, duration: 1.55 },
  { d: 'M195 318 C168 319 151 325 132 320 C111 315 100 303 100 288 C100 275 108 267 121 267 C139 267 153 280 154 296 C155 311 145 322 130 327', width: 34, delay: 5.24, duration: 1.12 },
  { d: 'M279 318 C306 319 323 325 342 320 C363 315 374 303 374 288 C374 275 366 267 353 267 C335 267 321 280 320 296 C319 311 329 322 344 327', width: 34, delay: 5.24, duration: 1.12 },
  { d: 'M204 352 C199 379 186 404 164 424 C140 446 108 437 99 411 C90 385 105 359 130 355 C145 353 153 362 150 375 C147 387 136 394 124 389', width: 40, delay: 5.36, duration: 1.22 },
  { d: 'M270 352 C275 379 288 404 310 424 C334 446 366 437 375 411 C384 385 369 359 344 355 C329 353 321 362 324 375 C327 387 338 394 350 389', width: 40, delay: 5.36, duration: 1.22 },
  { d: 'M211 352 C208 393 203 434 213 466 C220 488 231 505 237 511', width: 38, delay: 5.4, duration: 1.2 },
  { d: 'M263 352 C266 393 271 434 261 466 C254 488 243 505 237 511', width: 38, delay: 5.4, duration: 1.2 },
];

const AnimatedMaskPath: React.FC<RevealPath & { filterId: string }> = ({ d, width, delay, duration, filterId }) => (
  <motion.path
    d={d}
    fill="none"
    stroke="#fff"
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    filter={`url(#${filterId})`}
    variants={{
      hidden: { pathLength: 0, opacity: 0 },
      visible: {
        pathLength: 1,
        opacity: 1,
        transition: {
          pathLength: { duration, delay, ease: 'linear' },
          opacity: { duration: 0.18, delay },
        },
      },
    }}
  />
);

export const FleurDeLisReveal: React.FC<FleurDeLisRevealProps> = ({ className, label }) => {
  const reduce = useReducedMotion();
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = `fleur-reveal-${rawId}`;
  const accessibility = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };

  if (reduce) {
    return <img src={fleurDeLisTufting} className={className} alt={label ?? ''} draggable={false} decoding="async" />;
  }

  return (
    <motion.svg
      viewBox={VIEWBOX}
      className={cn('block h-auto w-full overflow-visible', className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-36px' }}
      data-fleur-reveal="layered"
      {...accessibility}
    >
      <defs>
        <filter id={`${id}-feather`} filterUnits="userSpaceOnUse" x="-24" y="-24" width="522" height="560">
          <feGaussianBlur stdDeviation="2.8" />
        </filter>
        <clipPath id={`${id}-clip-top`}><rect x="150" y="-20" width="174" height="348" /></clipPath>
        <clipPath id={`${id}-clip-left`}><rect x="-20" y="160" width="222" height="190" /></clipPath>
        <clipPath id={`${id}-clip-right`}><rect x="272" y="160" width="222" height="190" /></clipPath>
        <clipPath id={`${id}-clip-lower-left`}><rect x="76" y="342" width="137" height="116" /></clipPath>
        <clipPath id={`${id}-clip-lower-right`}><rect x="261" y="342" width="137" height="116" /></clipPath>
        <clipPath id={`${id}-clip-lower-center`}><rect x="202" y="342" width="70" height="190" /></clipPath>

        <mask id={`${id}-yellow-region`} maskUnits="userSpaceOnUse" x="-20" y="-20" width="514" height="552">
          <path d="M237 156 C229 175 228 215 230 251 C232 280 234 302 235 318 H239 C240 302 242 280 244 251 C246 215 245 175 237 156Z" fill="#fff" />
          <rect x="167" y="329" width="140" height="16" rx="8" fill="#fff" />
          <path d="M234 366 C231 386 229 407 231 426 C233 440 235 449 237 455 C239 449 241 440 243 426 C245 407 243 386 240 366Z" fill="#fff" />
        </mask>

        <mask id={`${id}-inner-orange-region`} maskUnits="userSpaceOnUse" x="-20" y="-20" width="514" height="552">
          <path d="M237 105 C219 132 212 177 214 223 C215 258 221 288 227 312 H247 C253 288 259 258 260 223 C262 177 255 132 237 105Z" fill="#fff" />
          <path d="M220 367 C218 387 217 408 221 429 C225 448 231 462 237 474 C243 462 249 448 253 429 C257 408 256 387 254 367Z" fill="#fff" />
        </mask>

        <mask id={`${id}-ivory-region`} maskUnits="userSpaceOnUse" x="-20" y="-20" width="514" height="552">
          <g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
            <path d="M222 315 C219 286 215 260 212 235 C208 201 205 169 211 143 C216 120 226 101 237 90" strokeWidth="10" />
            <path d="M252 315 C255 286 259 260 262 235 C266 201 269 169 263 143 C258 120 248 101 237 90" strokeWidth="10" />
            <path d="M76 301 C67 286 67 268 79 254 C95 235 123 233 144 247 C163 260 173 281 180 301" strokeWidth="10" />
            <path d="M398 301 C407 286 407 268 395 254 C379 235 351 233 330 247 C311 260 301 281 294 301" strokeWidth="10" />
            <path d="M197 357 C195 376 190 395 183 409" strokeWidth="9" />
            <path d="M277 357 C279 376 284 395 291 409" strokeWidth="9" />
          </g>
        </mask>

        <mask id={`${id}-outer-orange-full-region`} maskUnits="userSpaceOnUse" x="-20" y="-20" width="514" height="552">
          <path d="M237 20 C190 54 168 113 168 176 C168 227 184 273 202 316 H272 C290 273 306 227 306 176 C306 113 284 54 237 20Z" fill="#fff" />
          <g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
            <path d="M188 303 C161 319 130 329 99 318 C62 306 40 280 40 250 C40 220 64 198 92 195 C125 192 153 211 166 237 C178 262 169 288 148 302 C132 313 114 309 106 298 C100 289 104 281 113 276" strokeWidth="104" />
            <path d="M286 303 C313 319 344 329 375 318 C412 306 434 280 434 250 C434 220 410 198 382 195 C349 192 321 211 308 237 C296 262 305 288 326 302 C342 313 360 309 368 298 C374 289 370 281 361 276" strokeWidth="104" />
            <path d="M199 356 C194 380 180 403 159 417 C141 429 120 423 112 407 C105 392 111 378 124 371 C137 365 148 371 149 382 C150 390 144 397 136 401" strokeWidth="28" />
            <path d="M275 356 C280 380 294 403 315 417 C333 429 354 423 362 407 C369 392 363 378 350 371 C337 365 326 371 325 382 C324 390 330 397 338 401" strokeWidth="28" />
          </g>
          <path d="M214 354 C210 385 207 420 213 450 C218 475 228 492 237 501 C246 492 256 475 261 450 C267 420 264 385 260 354Z" fill="#fff" />
        </mask>

        <mask id={`${id}-outer-orange-top-region`} maskUnits="userSpaceOnUse" x="-20" y="-20" width="514" height="552">
          <path d="M237 20 C190 54 168 113 168 176 C168 227 184 273 202 316 H272 C290 273 306 227 306 176 C306 113 284 54 237 20Z" fill="#fff" />
        </mask>

        <mask id={`${id}-brown-region`} maskUnits="userSpaceOnUse" x="-20" y="-20" width="514" height="552">
          <g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
            <path d="M195 318 C178 278 160 232 158 185 C155 114 181 48 237 7" strokeWidth="28" />
            <path d="M279 318 C296 278 314 232 316 185 C319 114 293 48 237 7" strokeWidth="28" />
            <path d="M194 318 C161 327 137 341 101 337 C57 333 20 307 8 270 C-3 233 13 199 45 180 C80 160 122 169 153 192 C184 216 198 252 189 284 C182 307 163 324 139 331" strokeWidth="28" />
            <path d="M280 318 C313 327 337 341 373 337 C417 333 454 307 466 270 C477 233 461 199 429 180 C394 160 352 169 321 192 C290 216 276 252 285 284 C292 307 311 324 335 331" strokeWidth="28" />
            <path d="M195 318 C168 319 151 325 132 320 C111 315 100 303 100 288 C100 275 108 267 121 267 C139 267 153 280 154 296 C155 311 145 322 130 327" strokeWidth="24" />
            <path d="M279 318 C306 319 323 325 342 320 C363 315 374 303 374 288 C374 275 366 267 353 267 C335 267 321 280 320 296 C319 311 329 322 344 327" strokeWidth="24" />
            <path d="M204 352 C199 379 186 404 164 424 C140 446 108 437 99 411 C90 385 105 359 130 355 C145 353 153 362 150 375 C147 387 136 394 124 389" strokeWidth="26" />
            <path d="M270 352 C275 379 288 404 310 424 C334 446 366 437 375 411 C384 385 369 359 344 355 C329 353 321 362 324 375 C327 387 338 394 350 389" strokeWidth="26" />
            <path d="M211 352 C208 393 203 434 213 466 C220 488 231 505 237 511" strokeWidth="26" />
            <path d="M263 352 C266 393 271 434 261 466 C254 488 243 505 237 511" strokeWidth="26" />
          </g>
          <rect x="149" y="314" width="176" height="46" rx="23" fill="#fff" />
        </mask>

        <mask id={`${id}-progress`} maskUnits="userSpaceOnUse" x="-24" y="-24" width="522" height="560">
          <g data-reveal-stage="yellow" mask={`url(#${id}-yellow-region)`}>
            {yellowReveal.map((path, index) => <AnimatedMaskPath key={index} {...path} filterId={`${id}-feather`} />)}
          </g>
          <g data-reveal-stage="inner-orange" mask={`url(#${id}-inner-orange-region)`}>
            {innerOrangeReveal.map((path, index) => <AnimatedMaskPath key={index} {...path} filterId={`${id}-feather`} />)}
          </g>
          <g data-reveal-stage="ivory" mask={`url(#${id}-ivory-region)`}>
            {ivoryReveal.map((path, index) => <AnimatedMaskPath key={index} {...path} filterId={`${id}-feather`} />)}
          </g>
          <g data-reveal-stage="outer-orange" mask={`url(#${id}-outer-orange-full-region)`}>
            {outerOrangeReveal.map((path, index) => (
              <g
                key={index}
                clipPath={path.clip ? `url(#${id}-clip-${path.clip})` : undefined}
                mask={path.clip === 'top' ? `url(#${id}-outer-orange-top-region)` : undefined}
              >
                <AnimatedMaskPath {...path} filterId={`${id}-feather`} />
              </g>
            ))}
          </g>
          <g data-reveal-stage="brown" mask={`url(#${id}-brown-region)`}>
            {brownReveal.map((path, index) => <AnimatedMaskPath key={index} {...path} filterId={`${id}-feather`} />)}
          </g>
          <motion.rect
            x="-12"
            y="-12"
            width="498"
            height="536"
            fill="#fff"
            data-reveal-completion="soft"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { delay: 5.1, duration: 2.2, ease: 'easeInOut' } },
            }}
          />
        </mask>
      </defs>

      <image
        href={fleurDeLisTufting}
        width="474"
        height="512"
        preserveAspectRatio="xMidYMid meet"
        mask={`url(#${id}-progress)`}
      />
    </motion.svg>
  );
};
