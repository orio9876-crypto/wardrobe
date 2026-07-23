import assert from "node:assert/strict";
import test from "node:test";
import { isSupportedImage } from "../src/app/image-validation.js";

const file = (name, type) => ({ name, type });

test("accepts iPhone and browser image MIME variations", () => {
  assert.equal(isSupportedImage(file("iphone-photo.HEIC", "")), true);
  assert.equal(isSupportedImage(file("iphone-photo.heic", "application/octet-stream")), true);
  assert.equal(isSupportedImage(file("iphone-photo", "image/heic-sequence")), true);
  assert.equal(isSupportedImage(file("iphone-photo", "image/heif-sequence")), true);
  assert.equal(isSupportedImage(file("camera-photo", "image/jpeg")), true);
});

test("rejects unrelated files without an image MIME type or extension", () => {
  assert.equal(isSupportedImage(file("document.pdf", "application/pdf")), false);
  assert.equal(isSupportedImage(file("upload", "application/octet-stream")), false);
  assert.equal(isSupportedImage(file("notes.txt", "text/plain")), false);
  assert.equal(isSupportedImage(file("archive.zip", "application/zip")), false);
});
