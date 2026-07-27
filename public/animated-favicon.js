/**
 * Animated favicon: the site logo, blinking.
 *
 * SVG favicons are static in Chromium (SMIL and CSS animation are ignored in
 * the favicon context), so the only cross-browser approach is to rasterise
 * frames to a canvas and swap the icon href. The declared <link rel="icon">
 * SVG remains the fallback when this script does not run.
 *
 * Cost control: frames are only produced during a blink (~260 ms every few
 * seconds). Between blinks nothing is scheduled, the loop stops entirely while
 * the tab is hidden, and the whole effect is skipped under reduced-motion.
 */
(function () {
  'use strict';

  var SIZE = 32;
  var VIEWBOX = 1000;
  var BG = '#e5e5e5';
  var FG = '#0c0c0c';

  var STROKE =
    'M 495.28 270.98 C 510.57 268.54 526.71 279.20 530.42 294.27 C 541.34 338.30 552.38 382.29 563.45 426.28 C 574.44 472.27 586.49 518.01 597.59 563.97 C 600.10 574.51 597.05 586.55 588.88 593.89 C 585.50 597.40 580.96 599.37 576.55 601.24 C 570.50 602.74 564.19 602.51 558.00 602.53 C 518.00 602.55 478.00 602.40 438.00 602.75 C 429.66 602.99 420.73 602.23 413.68 597.32 C 409.41 593.94 405.08 590.24 402.69 585.23 C 397.81 575.67 397.20 563.73 402.26 554.12 C 406.13 546.25 413.83 540.65 422.33 538.77 C 430.81 537.86 439.36 538.54 447.86 538.21 C 454.19 537.11 460.62 537.69 467.01 537.57 C 482.35 537.35 497.71 537.33 513.06 537.26 C 515.26 537.24 517.37 536.32 519.21 535.16 C 521.23 533.06 520.97 529.78 520.56 527.12 C 504.30 461.14 487.74 395.23 471.50 329.25 C 469.74 321.67 467.52 314.20 466.05 306.56 C 464.78 300.83 465.39 294.72 467.45 289.25 C 470.60 283.10 475.33 277.44 481.76 274.58 C 485.92 272.32 490.67 271.72 495.28 270.98 Z';
  var EYE_LEFT =
    'M 313.46 302.83 C 327.19 300.71 341.78 305.55 351.27 315.73 C 358.83 323.11 363.52 333.39 364.01 343.95 C 364.96 358.37 358.34 372.99 346.89 381.80 C 343.05 384.57 338.76 386.64 334.42 388.48 C 327.12 391.41 319.07 390.97 311.40 390.34 C 302.31 388.22 293.57 383.65 287.29 376.64 C 276.77 365.51 272.54 348.53 277.29 333.88 C 280.57 324.91 285.84 316.30 293.88 310.87 C 299.45 306.32 306.50 304.13 313.46 302.83 Z';
  var EYE_RIGHT =
    'M 669.20 302.73 C 680.25 301.30 692.23 302.77 701.33 309.67 C 711.05 315.88 717.43 326.40 720.17 337.44 C 721.01 342.88 720.82 348.45 720.42 353.92 C 717.98 365.05 712.17 376.02 702.37 382.31 C 696.59 386.12 690.14 389.30 683.16 389.91 C 673.86 392.00 664.14 389.71 655.91 385.20 C 649.89 382.64 645.45 377.64 641.14 372.92 C 637.27 366.73 633.76 360.05 632.75 352.72 C 632.10 345.49 632.25 337.99 634.96 331.15 C 638.12 322.17 644.81 314.90 652.34 309.31 C 657.22 305.54 663.33 304.15 669.20 302.73 Z';
  var SMILE =
    'M 328.55 652.68 C 337.36 650.40 347.36 650.52 355.68 654.56 C 364.76 661.31 372.51 669.77 382.06 675.94 C 389.23 681.65 397.17 686.26 405.10 690.81 C 414.36 695.15 423.12 700.72 433.15 703.20 C 463.56 714.72 497.01 717.01 529.04 712.33 C 536.95 711.46 544.50 708.73 552.29 707.19 C 562.18 703.76 572.42 700.97 581.54 695.69 C 592.93 690.65 603.65 684.14 613.66 676.75 C 622.84 670.74 630.60 662.92 639.15 656.11 C 644.14 652.10 650.78 651.14 657.00 651.30 C 665.87 650.88 675.22 653.99 681.03 660.94 C 691.72 672.34 690.61 690.90 682.21 703.27 C 676.03 711.41 667.75 717.53 659.87 723.89 C 651.96 730.46 643.11 735.76 634.67 741.60 C 628.35 745.34 621.84 748.76 615.45 752.38 C 608.02 755.99 600.36 759.11 592.93 762.72 C 587.94 764.68 582.68 765.86 577.67 767.78 C 568.35 771.44 558.39 772.84 548.74 775.32 C 540.64 776.88 532.42 777.79 524.24 778.82 C 517.45 780.10 510.46 778.87 503.64 780.00 C 497.07 780.97 490.55 779.24 483.98 779.45 C 478.96 779.53 473.96 779.37 469.03 778.39 C 463.33 778.63 457.95 776.49 452.30 776.20 C 422.78 770.62 393.98 760.52 368.21 744.97 C 360.05 741.10 353.18 735.11 345.48 730.47 C 339.38 726.73 334.56 721.36 328.68 717.33 C 325.37 714.29 321.46 711.91 318.55 708.46 C 313.75 702.91 310.09 696.23 308.65 689.01 C 308.04 681.77 307.79 674.00 311.33 667.41 C 314.74 660.39 321.14 655.05 328.55 652.68 Z';

  var EYE_LEFT_CENTER = { x: 320, y: 346 };
  var EYE_RIGHT_CENTER = { x: 676, y: 346 };

  var BLINK_MS = 260;
  var MIN_GAP_MS = 3200;
  var MAX_GAP_MS = 6800;

  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  if (typeof Path2D !== 'function') return;

  var reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var paths;
  try {
    paths = {
      stroke: new Path2D(STROKE),
      eyeLeft: new Path2D(EYE_LEFT),
      eyeRight: new Path2D(EYE_RIGHT),
      smile: new Path2D(SMILE),
    };
  } catch (error) {
    return;
  }

  var link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  var originalHref = link.getAttribute('href');
  var originalType = link.getAttribute('type');

  function drawEye(path, center, openness) {
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.scale(1, openness);
    ctx.translate(-center.x, -center.y);
    ctx.fill(path);
    ctx.restore();
  }

  function draw(openness) {
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.save();
    ctx.scale(SIZE / VIEWBOX, SIZE / VIEWBOX);

    ctx.fillStyle = BG;
    ctx.beginPath();
    ctx.arc(VIEWBOX / 2, VIEWBOX / 2, VIEWBOX / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = FG;
    ctx.fill(paths.stroke);
    ctx.fill(paths.smile);
    drawEye(paths.eyeLeft, EYE_LEFT_CENTER, openness);
    drawEye(paths.eyeRight, EYE_RIGHT_CENTER, openness);

    ctx.restore();
  }

  function commit() {
    try {
      link.setAttribute('type', 'image/png');
      link.setAttribute('href', canvas.toDataURL('image/png'));
    } catch (error) {
      stop();
    }
  }

  var frameId = null;
  var timerId = null;
  var stopped = false;

  /** Closed at the midpoint, open at both ends, eased so the lid snaps shut and eases open. */
  function opennessAt(progress) {
    var closed = 1 - Math.sin(progress * Math.PI);
    return 0.08 + 0.92 * (1 - Math.pow(closed, 0.55));
  }

  function blink(startedAt) {
    frameId = window.requestAnimationFrame(function (now) {
      if (stopped) return;
      var progress = Math.min(1, (now - startedAt) / BLINK_MS);
      draw(opennessAt(progress));
      commit();
      if (progress < 1) {
        blink(startedAt);
      } else {
        frameId = null;
        scheduleBlink();
      }
    });
  }

  function scheduleBlink() {
    if (stopped) return;
    var gap = MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS);
    timerId = window.setTimeout(function () {
      if (stopped || document.hidden) return;
      blink(window.performance ? window.performance.now() : Date.now());
    }, gap);
  }

  function stop() {
    stopped = true;
    if (frameId !== null) window.cancelAnimationFrame(frameId);
    if (timerId !== null) window.clearTimeout(timerId);
    frameId = null;
    timerId = null;
    if (originalHref) {
      link.setAttribute('href', originalHref);
      if (originalType) link.setAttribute('type', originalType);
      else link.removeAttribute('type');
    }
  }

  function pause() {
    if (frameId !== null) window.cancelAnimationFrame(frameId);
    if (timerId !== null) window.clearTimeout(timerId);
    frameId = null;
    timerId = null;
  }

  document.addEventListener('visibilitychange', function () {
    if (stopped) return;
    if (document.hidden) {
      pause();
    } else {
      draw(1);
      commit();
      scheduleBlink();
    }
  });

  draw(1);
  commit();
  scheduleBlink();
})();
