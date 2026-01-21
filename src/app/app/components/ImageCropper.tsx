"use client";

import React, { useState, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { motion, AnimatePresence } from "framer-motion";

interface ImageCropperProps {
    image: string;
    onCropComplete: (croppedImage: Blob) => void;
    onCancel: () => void;
    circular?: boolean;
}

export default function ImageCropper({ image, onCropComplete, onCancel, circular = true }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
    const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const img = new Image();
            img.addEventListener("load", () => resolve(img));
            img.addEventListener("error", (error) => reject(error));
            img.setAttribute("crossOrigin", "anonymous");
            img.src = url;
        });

    const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<{ blob: Blob; url: string }> => {
        const img = await createImage(imageSrc);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("No 2d context");
        }

        // We want a high quality square output for profile pictures
        const targetSize = 600;
        canvas.width = targetSize;
        canvas.height = targetSize;

        ctx.drawImage(
            img,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            targetSize,
            targetSize
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Canvas is empty"));
                    return;
                }
                const url = URL.createObjectURL(blob);
                resolve({ blob, url });
            }, "image/jpeg", 0.95);
        });
    };

    const handlePreview = async () => {
        if (!croppedAreaPixels) return;
        setIsGeneratingPreview(true);
        try {
            const { blob, url } = await getCroppedImg(image, croppedAreaPixels);
            setCroppedBlob(blob);
            setPreviewUrl(url);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingPreview(false);
        }
    };

    const handleConfirm = () => {
        if (croppedBlob) {
            onCropComplete(croppedBlob);
        }
    };

    // Cleanup object URL on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative h-[600px] w-full max-w-2xl overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl flex flex-col"
            >
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <h3 className="text-white font-semibold">
                        {previewUrl ? "Preview Profile Picture" : "Crop Profile Picture"}
                    </h3>
                    {!previewUrl && (
                        <span className="text-xs text-zinc-400">Drag to move • Scroll to zoom</span>
                    )}
                </div>

                <div className="flex-1 relative bg-zinc-950 flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="wait">
                        {!previewUrl ? (
                            <motion.div
                                key="cropper"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0"
                            >
                                <Cropper
                                    image={image}
                                    crop={crop}
                                    zoom={zoom}
                                    aspect={1}
                                    cropShape={circular ? "round" : "rect"}
                                    showGrid={false}
                                    onCropChange={onCropChange}
                                    onCropComplete={onCropCompleteInternal}
                                    onZoomChange={onZoomChange}
                                    restrictPosition={false}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="preview"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex flex-col items-center gap-6"
                            >
                                <div className="relative w-64 h-64">
                                    {/* Shadow layer */}
                                    <div className="absolute inset-0 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.5)] z-0" />
                                    {/* Real circular preview */}
                                    <div className="w-full h-full rounded-full border-4 border-zinc-800 overflow-hidden relative z-10 bg-zinc-800">
                                        <img src={previewUrl} alt="Cropped preview" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-400 text-center max-w-[280px]">
                                    This is exactly how your profile picture will appear to other members.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-6 bg-zinc-900 border-t border-zinc-800">
                    {!previewUrl ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={5}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => onZoomChange(Number(e.target.value))}
                                    className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    onClick={onCancel}
                                    className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePreview}
                                    disabled={isGeneratingPreview}
                                    className="rounded-lg bg-zinc-100 px-6 py-2.5 text-sm font-bold text-zinc-900 shadow-xl hover:bg-white transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isGeneratingPreview ? "Processing..." : "Continue"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => {
                                    setPreviewUrl(null);
                                    setCroppedBlob(null);
                                }}
                                className="flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Adjust Crop
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="rounded-lg bg-purple-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition-all active:scale-95"
                            >
                                Looks Great!
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

