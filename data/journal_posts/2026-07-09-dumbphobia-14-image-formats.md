---
title: DumbPhobia#014 Image Formats
date: 2026-07-09
tags: [frontend, system]
image: /assets/post-covers/dumbphobia-images.jpg
---

# PNG vs JPG vs SVG vs WebP: The Science Behind Image Formats

Digital images look simple on the screen, but each image format is built from a different scientific idea. Some formats store **exact pixels**, some store **approximate pixels**, some store **mathematical shapes**, and some combine multiple compression techniques.

The core difference is this:

> **PNG and JPG store pixels. SVG stores geometry. WebP stores pixels using modern prediction and compression methods.**

---

# 1. Before comparing formats: what is an image?

A normal digital image is a matrix of pixels.

For example, a 1920 × 1080 image contains:

$$
1920 \times 1080 = 2,073,600 \text{ pixels}
$$

Each pixel usually stores color values.

For RGB:

$$
Pixel = (R, G, B)
$$

Each channel often uses 8 bits:

$$
R, G, B \in [0, 255]
$$

So one pixel usually needs:

$$
8 + 8 + 8 = 24 \text{ bits} = 3 \text{ bytes}
$$

A raw 1920 × 1080 RGB image would need:

$$
1920 \times 1080 \times 3 = 6,220,800 \text{ bytes}
$$

That is about **6.2 MB uncompressed**.

Image formats exist because storing raw pixels is expensive.

---

# 2. PNG: exact pixels, compressed without losing data

## Main idea

**PNG** stands for **Portable Network Graphics**. It is a raster image format, meaning it stores a grid of pixels. Its main purpose is **lossless compression**, meaning the decoded image can reconstruct the original pixel data exactly. PNG was designed as a patent-free replacement for GIF and supports grayscale, indexed color, truecolor, and optional alpha transparency. ([W3C][1])

PNG is best when the image contains:

* sharp edges
* text
* UI screenshots
* logos
* icons
* transparent backgrounds

## History

PNG was developed in the 1990s as a better, open replacement for GIF. GIF had patent/licensing problems around its LZW compression, so PNG was created to provide a free and technically stronger format. The W3C PNG specification describes it as a portable, extensible, lossless raster image format. ([W3C][1])

## How PNG stores data

A PNG file is organized into **chunks**.

Common chunks include:

| Chunk  | Purpose                                            |
| ------ | -------------------------------------------------- |
| `IHDR` | Image header: width, height, bit depth, color type |
| `PLTE` | Palette, if indexed color is used                  |
| `IDAT` | Actual compressed image data                       |
| `IEND` | End of file                                        |

PNG stores pixels row by row. Each row is called a **scanline**. The PNG specification describes scanlines as sequences of bytes, and PNG may apply filters before compression to make the data easier to compress. ([W3C][2])

## PNG compression algorithm

PNG compression has two main stages:

1. **Filtering**
2. **DEFLATE compression**

### Stage 1: Filtering

PNG does not immediately compress raw pixels. First, it transforms pixel values into smaller difference values.

For example, instead of storing:

$$
100, 102, 103, 105
$$

PNG may store differences:

$$
100, 2, 1, 2
$$

Small numbers are easier to compress.

PNG filters are reversible and lossless. That means the original pixel values can be reconstructed exactly after decompression. ([W3C][2])

PNG has five basic filter types:

| Filter  | Idea                                       |
| ------- | ------------------------------------------ |
| None    | Store bytes directly                       |
| Sub     | Predict from the pixel on the left         |
| Up      | Predict from the pixel above               |
| Average | Predict from the average of left and above |
| Paeth   | Predict from left, above, and upper-left   |

### Paeth predictor

The Paeth filter uses nearby pixels to estimate the current pixel.

Let:

* (a) = left pixel
* (b) = above pixel
* (c) = upper-left pixel

The initial prediction is:

$$
p = a + b - c
$$

Then PNG chooses whichever of (a), (b), or (c) is closest to (p).

$$
Paeth(a,b,c) = \text{closest}(a,b,c \text{ to } p)
$$

Then PNG stores:

$$
Residual = ActualPixel - PredictedPixel
$$

This is useful because neighboring pixels are often similar.

### Stage 2: DEFLATE

After filtering, PNG uses **DEFLATE**, the same general compression method used in ZIP files.

DEFLATE combines:

1. **LZ77-style dictionary compression**
2. **Huffman coding**

The basic idea:

* repeated patterns are replaced with references
* frequent symbols get shorter binary codes
* rare symbols get longer binary codes

PNG compression is lossless, so the original image data can be reconstructed exactly. ([libpng][3])

## PNG mathematical summary

PNG does this:

$$
OriginalPixels \rightarrow FilteredResiduals \rightarrow DEFLATE \rightarrow PNGFile
$$

When decoding:

$$
PNGFile \rightarrow Inflate \rightarrow ReverseFilter \rightarrow OriginalPixels
$$

No image information is intentionally destroyed.

## PNG strength

PNG is excellent for exact visual data.

A screenshot with text should use PNG because text edges must stay sharp.

## PNG weakness

PNG is often large for photos because photos have complex color variation. Lossless compression cannot throw away detail, so file size remains higher.

---

# 3. JPG / JPEG: approximate pixels using human vision

## Main idea

**JPEG** is a lossy raster image format. It stores pixels, but it intentionally removes image information that humans are less likely to notice. JPEG is especially designed for photographs and real-world images.

JPEG is good for:

* camera photos
* natural images
* gradients
* large background images

JPEG is bad for:

* logos
* text
* screenshots
* line art
* UI images

## History

JPEG stands for **Joint Photographic Experts Group**, the group that created the standard. It became widely used because it could make photographic images much smaller while keeping acceptable visual quality. JPEG usually allows adjustable compression, meaning users can trade quality for file size. ([Wikipedia][4])

## Scientific idea

JPEG is based on a key observation:

> Human eyes are more sensitive to brightness detail than color detail, and less sensitive to very high-frequency detail.

In simple terms, we notice the shape of objects more than tiny color changes.

JPEG exploits this.

## JPEG compression pipeline

A simplified JPEG encoder works like this:

$$
RGB \rightarrow YCbCr \rightarrow ChromaSubsampling \rightarrow 8 \times 8 Blocks \rightarrow DCT \rightarrow Quantization \rightarrow Zigzag \rightarrow RunLength \rightarrow HuffmanCoding
$$

A survey of JPEG compression describes the common steps as color-space conversion, downsampling, DCT, quantization, and entropy encoding. ([arXiv][5])

---

## Step 1: RGB to YCbCr

JPEG usually converts RGB into YCbCr.

* (Y) = brightness/luminance
* (Cb) = blue color difference
* (Cr) = red color difference

Approximate formulas:

$$
Y = 0.299R + 0.587G + 0.114B
$$

$$
Cb = -0.1687R - 0.3313G + 0.5B + 128
$$

$$
Cr = 0.5R - 0.4187G - 0.0813B + 128
$$

Why?

Because human vision cares more about (Y), the brightness channel, than (Cb) and (Cr), the color channels.

---

## Step 2: Chroma subsampling

JPEG may reduce color resolution.

A common mode is **4:2:0**.

This means color information is stored at lower resolution than brightness information.

Conceptually:

$$
Y = \text{full resolution}
$$

$$
Cb, Cr = \text{reduced resolution}
$$

This saves space because humans usually do not notice small color-detail loss as much as brightness-detail loss.

---

## Step 3: Split into 8 × 8 blocks

JPEG divides the image into blocks:

$$
8 \times 8 = 64 \text{ values}
$$

Each block is processed separately.

This is why low-quality JPEGs often show **block artifacts**. You can sometimes see square patterns because each block was compressed independently.

---

## Step 4: Discrete Cosine Transform

The mathematical heart of JPEG is the **DCT**, or Discrete Cosine Transform.

The DCT converts pixel values from the spatial domain into the frequency domain.

Spatial domain:

> “What is the pixel value here?”

Frequency domain:

> “How much smooth area, edge, and fine detail exist in this block?”

For an 8 × 8 block (f(x,y)), the 2D DCT is:

$$
F(u,v) = \frac{1}{4} C(u)C(v)
\sum_{x=0}^{7}\sum_{y=0}^{7}
f(x,y)
\cos\left[\frac{(2x+1)u\pi}{16}\right]
\cos\left[\frac{(2y+1)v\pi}{16}\right]
$$

where:

$$
C(k) =
\begin{cases}
\frac{1}{\sqrt{2}}, & k = 0 \\
1, & k > 0
\end{cases}
$$

The result is 64 frequency coefficients.

* (F(0,0)) = average brightness of the block
* higher (u,v) values = sharper details and texture

JPEG uses DCT because much of the important image information tends to concentrate in low-frequency coefficients. ([arXiv][6])

---

## Step 5: Quantization

This is where JPEG becomes lossy.

Each DCT coefficient is divided by a quantization value and rounded:

$$
Q(u,v) = round\left(\frac{F(u,v)}{T(u,v)}\right)
$$

where:

* (F(u,v)) = DCT coefficient
* (T(u,v)) = quantization table value
* (Q(u,v)) = stored quantized value

Large quantization values remove more detail.

High-frequency details usually receive stronger quantization because humans notice them less.

This is the main source of JPEG quality loss.

Example:

$$
F = 37,\quad T = 10
$$

$$
Q = round(37/10) = 4
$$

When decoding:

$$
F' = Q \times T = 4 \times 10 = 40
$$

Original was 37, decoded becomes 40.

The error is:

$$
Error = 40 - 37 = 3
$$

That error is permanent.

---

## Step 6: Zigzag scanning

After quantization, many high-frequency values become zero.

JPEG reorders the 8 × 8 block in a zigzag pattern, moving from low-frequency coefficients to high-frequency coefficients.

This tends to create long runs of zeros:

$$
15, -2, 1, 0, 0, 0, 0, 0, ...
$$

---

## Step 7: Run-length and Huffman coding

JPEG then compresses the symbols.

Instead of storing:

$$
0,0,0,0,0,0
$$

it can store something like:

$$
6 \text{ zeros}
$$

Then Huffman coding gives shorter bit codes to more frequent symbols. Baseline JPEG uses DCT-based compression with run-length and Huffman coding. ([School of Engineering & Applied Science][7])

## JPEG mathematical summary

JPEG does this:

$$
Pixels \rightarrow Frequencies \rightarrow QuantizedFrequencies \rightarrow EntropyCoding
$$

The most important lossy step is:

$$
Q(u,v) = round\left(\frac{F(u,v)}{T(u,v)}\right)
$$

## JPEG strength

JPEG makes photos very small.

## JPEG weakness

JPEG damages sharp edges and text.

That is why screenshots saved as JPG often look blurry or dirty.

---

# 4. SVG: images as mathematical objects

## Main idea

**SVG** stands for **Scalable Vector Graphics**.

Unlike PNG and JPG, SVG is not primarily a pixel format. It is a vector format. SVG describes images using mathematical shapes such as:

* lines
* circles
* rectangles
* curves
* paths
* gradients
* text

SVG is an XML-based language for describing two-dimensional vector and mixed vector/raster graphics. It is scalable and can be used inside HTML or as a standalone file. ([W3C][8])

## History

SVG was developed by the W3C as an open standard for web vector graphics. It was designed to work naturally with the web platform: XML, CSS, JavaScript, DOM, and HTML. The W3C describes SVG as having both an XML-based file format and a programming API for graphical applications. ([W3C][9])

## How SVG stores data

SVG stores text instructions.

Example:

```xml
<svg width="200" height="200">
  <circle cx="100" cy="100" r="50" fill="red" />
</svg>
```

This does not store every pixel of the circle.

It stores the rule:

> Draw a circle centered at ((100,100)) with radius (50).

The browser then rasterizes it into pixels at display time.

## SVG mathematical model

A circle is stored mathematically as:

$$
(x - h)^2 + (y - k)^2 = r^2
$$

where:

* ((h,k)) is the center
* (r) is the radius

A line can be represented as:

$$
y = mx + b
$$

A rectangle can be represented by:

$$
x, y, width, height
$$

SVG paths can also use Bézier curves.

A cubic Bézier curve is:

$$
B(t) = (1-t)^3P_0 + 3(1-t)^2tP_1 + 3(1-t)t^2P_2 + t^3P_3
$$

where:

$$
0 \leq t \leq 1
$$

The points (P_0, P_1, P_2, P_3) control the curve.

This is why SVG scales perfectly.

If you zoom a PNG logo, the pixels become visible.

If you zoom an SVG logo, the browser recalculates the shapes at the new size.

## SVG path example

```xml
<path d="M 10 80 C 40 10, 65 10, 95 80" stroke="black" fill="transparent"/>
```

Meaning:

* `M 10 80` = move to point ((10,80))
* `C` = draw cubic Bézier curve
* control points define the curve shape

SVG paths are a central part of the SVG standard. ([W3C][10])

## SVG compression

Normal SVG is text, so it can be compressed with gzip.

Compressed SVG often uses:

```text
.svgz
```

This is basically gzipped SVG.

## SVG strength

SVG is ideal for:

* logos
* icons
* diagrams
* charts
* simple illustrations
* UI symbols

## SVG weakness

SVG is bad for complex photos.

A photo has millions of tiny color changes. Describing a real photograph as vector geometry would be extremely complex.

Also, SVG can include scripts and external references, so user-uploaded SVG files should be sanitized before being allowed into a web app.

---

# 5. WebP: modern web compression

## Main idea

**WebP** is a modern raster image format created by Google. It supports both lossy and lossless compression. It also supports transparency and animation. Google describes WebP as an image format for the web, with lossy compression based on predictive coding from the VP8 video codec and lossless compression based on already-seen image fragments. ([Google for Developers][11])

WebP tries to answer this question:

> Can we get JPG-like or PNG-like quality with smaller file size?

Often, yes.

## History

Google announced WebP in 2010 as a new image format for the web. The first version used compression technology based on VP8, which Google had open-sourced earlier that year. ([Google Developers Blog][12])

WebP later added important features such as lossless compression and alpha transparency. Google announced lossless and transparency support in 2011, positioning it as a more efficient option for web images that previously required PNG for transparency. ([Google Developers Blog][13])

## WebP storage model

WebP is a raster format, so it stores pixel-based images.

But unlike PNG, it can be lossy or lossless.

It can work like:

```text
Photo → lossy WebP
Logo/UI → lossless WebP
Transparent image → WebP with alpha
Animation → animated WebP
```

## WebP lossy algorithm

Lossy WebP uses predictive coding.

The idea:

> Predict a block of pixels from nearby blocks, then store the difference between the prediction and the real block.

Google’s WebP documentation says lossy WebP uses neighboring pixel blocks to predict values, then encodes only the difference. ([Google for Developers][11])

Mathematically:

$$
Residual = Actual - Predicted
$$

If the prediction is good, the residual is small.

Small residuals compress well.

For example:

$$
Actual = 105
$$

$$
Predicted = 103
$$

$$
Residual = 105 - 103 = 2
$$

Instead of storing 105 directly, WebP stores the smaller difference.

This is similar in spirit to video compression, where frames or blocks are predicted from nearby information.

## WebP lossless algorithm

Lossless WebP uses already-seen image fragments to reconstruct new pixels. It can also use a local palette if that is more efficient. ([Google for Developers][11])

Conceptually:

$$
NewRegion \approx PreviousRegion
$$

If the same pattern already appeared earlier, WebP can store a reference instead of storing the full pixel data again.

This is useful for:

* icons
* UI graphics
* repeated patterns
* transparent images
* illustrations

## WebP alpha transparency

WebP supports transparency, like PNG.

But unlike traditional JPG, WebP can store alpha:

$$
Pixel = (R, G, B, A)
$$

where:

$$
A = \text{alpha/transparency}
$$

For example:

* (A = 255): fully visible
* (A = 0): fully transparent
* (A = 128): semi-transparent

This makes WebP useful for modern websites.

## WebP mathematical summary

Lossy WebP:

$$
Pixels \rightarrow Prediction \rightarrow Residuals \rightarrow Transform/Quantization \rightarrow EntropyCoding
$$

Lossless WebP:

$$
Pixels \rightarrow Prediction/Matching/Palette \rightarrow EntropyCoding
$$

The important idea is:

$$
Residual = Actual - Predicted
$$

## WebP strength

WebP is usually excellent for web performance.

It can replace many uses of JPG and PNG:

* photos
* thumbnails
* lesson images
* banners
* transparent UI graphics
* animated images

## WebP weakness

WebP is not always the best editing/master format.

For design source files, PNG, SVG, PSD, Figma, or original camera formats may still be better. WebP is usually best as a delivery format for the web.

---

# 6. Deep comparison

## Raster vs vector

| Format | Model  | Meaning                               |
| ------ | ------ | ------------------------------------- |
| PNG    | Raster | Stores exact pixels                   |
| JPG    | Raster | Stores approximate pixels             |
| SVG    | Vector | Stores mathematical shapes            |
| WebP   | Raster | Stores pixels with modern compression |

## Lossy vs lossless

| Format |        Lossless |           Lossy |
| ------ | --------------: | --------------: |
| PNG    |             Yes |              No |
| JPG    |              No |             Yes |
| SVG    | Not pixel-based | Not pixel-based |
| WebP   |             Yes |             Yes |

## Transparency

| Format | Transparency |
| ------ | ------------ |
| PNG    | Yes          |
| JPG    | No           |
| SVG    | Yes          |
| WebP   | Yes          |

## Best use

| Use case             | Best format                     |
| -------------------- | ------------------------------- |
| Photo                | JPG or WebP                     |
| Website photo        | WebP                            |
| Screenshot           | PNG                             |
| Logo                 | SVG                             |
| Icon                 | SVG                             |
| Transparent UI image | PNG or WebP                     |
| Complex illustration | PNG/WebP                        |
| Simple diagram       | SVG                             |
| Animation            | WebP or GIF, often WebP for web |

---

# 7. Why JPG looks bad around text

Text has sharp edges.

Sharp edges are high-frequency information.

JPEG’s quantization often removes high-frequency detail:

$$
Q(u,v) = round\left(\frac{F(u,v)}{T(u,v)}\right)
$$

When high-frequency coefficients are reduced or removed, text edges become blurry.

That creates:

* ringing artifacts
* mosquito noise
* blockiness
* dirty-looking edges

That is why JPG is bad for screenshots and UI.

---

# 8. Why PNG is large for photos

Photos have many small natural variations.

Example:

$$
Pixel_1 = (101, 104, 99)
$$

$$
Pixel_2 = (102, 103, 101)
$$

$$
Pixel_3 = (99, 105, 100)
$$

Lossless compression must preserve all those small differences.

PNG cannot say:

> “These are close enough; throw some detail away.”

JPEG and lossy WebP can do that.

So for photos:

$$
JPG/WebP \ll PNG
$$

in file size.

---

# 9. Why SVG scales perfectly

PNG, JPG, and WebP store pixel grids.

If a PNG is 100 × 100 and you display it at 1000 × 1000, the browser must stretch the pixels.

But SVG stores shapes.

A circle remains:

$$
(x-h)^2 + (y-k)^2 = r^2
$$

At any screen size, the browser recalculates the curve and fills the pixels again.

So SVG does not become blurry when scaled.

---

# 10. Format by algorithm

## PNG algorithm

```text
Input pixels
↓
Choose color type and bit depth
↓
Split into scanlines
↓
Apply reversible filters
↓
Compress with DEFLATE
↓
Store in PNG chunks
```

Core idea:

$$
StoreExact(Image)
$$

PNG is about exactness.

---

## JPG algorithm

```text
Input pixels
↓
Convert RGB to YCbCr
↓
Reduce color detail
↓
Split into 8×8 blocks
↓
Apply DCT
↓
Quantize coefficients
↓
Zigzag scan
↓
Run-length encode zeros
↓
Huffman encode
```

Core idea:

$$
StoreApproximation(Image)
$$

JPEG is about perceptual approximation.

---

## SVG algorithm

```text
Input drawing
↓
Describe shapes, paths, text, gradients
↓
Store as XML
↓
Browser rasterizes at display time
```

Core idea:

$$
StoreGeometry(Scene)
$$

SVG is about mathematical description.

---

## WebP algorithm

```text
Input pixels
↓
Choose lossy or lossless mode
↓
Predict blocks or reuse previous fragments
↓
Store residuals or references
↓
Entropy encode
↓
Store as WebP
```

Core idea:

$$
StorePredictionErrors(Image)
$$

WebP is about modern prediction-based compression.

---

# 11. Practical rule for a web app

For your gamified e-learning platform, use this rule:

| Asset type                    | Recommended format                       |
| ----------------------------- | ---------------------------------------- |
| App logo                      | SVG                                      |
| Sidebar icons                 | SVG                                      |
| Achievement badges            | SVG if simple, WebP/PNG if detailed      |
| Lesson diagrams               | SVG if geometric, PNG if screenshot-like |
| Screenshots                   | PNG                                      |
| Student/profile photos        | WebP or JPG                              |
| Banners                       | WebP                                     |
| Background illustrations      | WebP                                     |
| Admin UI icons                | SVG                                      |
| Transparent decorative images | WebP or PNG                              |

A good production setup is:

```text
Source design: SVG / PNG / original image
↓
Optimization build step
↓
Website delivery: SVG for vector, WebP for raster
```

---

# 12. Final mental model

Think of the formats like this:

## PNG

> “Store every pixel exactly, but compress repeated patterns.”

Formula:

$$
DecodedImage = OriginalImage
$$

Best for exact images.

---

## JPG

> “Store a visually acceptable approximation by removing details humans notice less.”

Formula:

$$
DecodedImage \approx OriginalImage
$$

Best for photos.

---

## SVG

> “Do not store pixels. Store mathematical drawing instructions.”

Formula:

$$
Image = Shapes + Paths + Styles
$$

Best for logos, icons, and diagrams.

---

## WebP

> “Use modern prediction to store images smaller for the web.”

Formula:

$$
Residual = Actual - Predicted
$$

Best for optimized web delivery.

---

# Conclusion

PNG, JPG, SVG, and WebP are not just file extensions. They represent four different philosophies of visual information.

**PNG** believes in exact pixel preservation.

**JPG** believes in human-vision-based approximation.

**SVG** believes in mathematical shape descriptions.

**WebP** believes in prediction-based web optimization.

For modern websites, the best choice is usually not one format everywhere. The best choice is:

> **SVG for logos/icons, PNG for exact screenshots, JPG for simple photo compatibility, and WebP for optimized web images.**

[1]: https://www.w3.org/TR/REC-png-961001?utm_source=chatgpt.com "PNG (Portable Network Graphics) Specification"
[2]: https://www.w3.org/TR/png-3/?utm_source=chatgpt.com "Portable Network Graphics (PNG) Specification (Third ..."
[3]: https://www.libpng.org/pub/png/book/chapter09.html?utm_source=chatgpt.com "Compression and Filtering (PNG: The Definitive Guide)"
[4]: https://en.wikipedia.org/wiki/JPEG?utm_source=chatgpt.com "JPEGs"
[5]: https://arxiv.org/abs/1912.10789?utm_source=chatgpt.com "JPEG Image Compression using the Discrete Cosine Transform: An Overview, Applications, and Hardware Implementation"
[6]: https://arxiv.org/abs/1705.03531?utm_source=chatgpt.com "New Transforms for JPEG Format"
[7]: https://www2.seas.gwu.edu/~ayoussef/cs225/standards.html?utm_source=chatgpt.com "jpeg and mpeg standards"
[8]: https://www.w3.org/TR/SVG2/?utm_source=chatgpt.com "Scalable Vector Graphics (SVG) 2"
[9]: https://www.w3.org/Graphics/SVG/About.html?utm_source=chatgpt.com "Scalable Vector Graphics (SVG)"
[10]: https://www.w3.org/TR/SVG11/paths.html?utm_source=chatgpt.com "Paths – SVG 1.1 (Second Edition)"
[11]: https://developers.google.com/speed/webp?utm_source=chatgpt.com "An image format for the Web | WebP"
[12]: https://developers.googleblog.com/en/webp-a-new-image-format-for-the-web/?utm_source=chatgpt.com "WebP, a new image format for the Web"
[13]: https://developers.googleblog.com/lossless-and-transparency-encoding-in-webp/?utm_source=chatgpt.com "Lossless and transparency encoding in WebP"

