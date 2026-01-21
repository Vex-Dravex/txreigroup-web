"use client";

import { useState } from "react";
import { FormSection } from "./FormElements";
import { motion, AnimatePresence } from "framer-motion";

interface ImageFile {
    id: string;
    file: File;
    preview: string;
}

interface ImageGridSectionProps {
    onImagesChange: (files: File[], primaryIndex: number) => void;
}

export function ImageGridSection({ onImagesChange }: ImageGridSectionProps) {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [primaryId, setPrimaryId] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const handleFiles = (files: FileList) => {
        const newFiles = Array.from(files).filter(f => f.type.startsWith("image/"));

        const newImageFiles: ImageFile[] = newFiles.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            preview: URL.createObjectURL(file)
        }));

        const updatedImages = [...images, ...newImageFiles];
        setImages(updatedImages);

        if (!primaryId && updatedImages.length > 0) {
            setPrimaryId(updatedImages[0].id);
        }

        notifyChange(updatedImages, primaryId || (updatedImages.length > 0 ? updatedImages[0].id : null));
    };

    const removeImage = (id: string) => {
        const updatedImages = images.filter(img => img.id !== id);
        setImages(updatedImages);

        let newPrimaryId = primaryId;
        if (primaryId === id) {
            newPrimaryId = updatedImages.length > 0 ? updatedImages[0].id : null;
            setPrimaryId(newPrimaryId);
        }

        notifyChange(updatedImages, newPrimaryId);
    };

    const setPrimary = (id: string) => {
        setPrimaryId(id);
        notifyChange(images, id);
    };

    const moveImage = (index: number, direction: 'left' | 'right') => {
        const newImages = [...images];
        const newIndex = direction === 'left' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= newImages.length) return;

        const temp = newImages[index];
        newImages[index] = newImages[newIndex];
        newImages[newIndex] = temp;

        setImages(newImages);
        notifyChange(newImages, primaryId);
    };

    const notifyChange = (currentImages: ImageFile[], currentPrimaryId: string | null) => {
        const files = currentImages.map(img => img.file);
        const primaryIndex = currentImages.findIndex(img => img.id === currentPrimaryId);
        onImagesChange(files, primaryIndex === -1 ? 0 : primaryIndex);
    };

    return (
        <FormSection title="Property Gallery" description="Upload multiple photos. The first photo is your primary thumbnail by default, but you can select any photo as primary.">
            <div className="space-y-6">
                {/* Upload Area */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                    onDragLeave={() => setIsDragActive(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragActive(false);
                        if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
                    }}
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.multiple = true;
                        input.accept = 'image/*';
                        input.onchange = (e: any) => e.target.files && handleFiles(e.target.files);
                        input.click();
                    }}
                    className={`group flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 transition-all cursor-pointer ${isDragActive
                            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                            : "border-zinc-200 hover:border-blue-400 dark:border-zinc-800 dark:hover:border-blue-500/50"
                        }`}
                >
                    <div className={`p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110 ${isDragActive ? "bg-blue-600 text-white scale-110" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500"}`}>
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Upload Property Photos</p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 font-medium tracking-wide">DRAG & DROP OR CLICK TO BROWSE</p>
                </div>

                {/* Image Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <AnimatePresence>
                        {images.map((img, index) => (
                            <motion.div
                                key={img.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${primaryId === img.id
                                        ? "border-blue-500 ring-4 ring-blue-500/10 shadow-lg"
                                        : "border-zinc-100 dark:border-zinc-800"
                                    }`}
                            >
                                <img src={img.preview} className="h-full w-full object-cover transition-transform group-hover:scale-110" alt={`Property ${index + 1}`} />

                                {/* Primary Badge */}
                                {primaryId === img.id && (
                                    <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-blue-600 text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
                                        Primary
                                    </div>
                                )}

                                {/* Index Badge */}
                                <div className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-lg bg-black/50 backdrop-blur-md text-[10px] font-black text-white border border-white/20">
                                    {index + 1}
                                </div>

                                {/* Overlay Controls */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setPrimary(img.id)}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${primaryId === img.id ? "bg-white text-blue-600" : "bg-blue-600 text-white hover:bg-blue-500"
                                                }`}
                                        >
                                            {primaryId === img.id ? "Selected" : "Set Primary"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeImage(img.id)}
                                            className="p-1.5 rounded-xl bg-red-500 text-white hover:bg-red-400 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            disabled={index === 0}
                                            onClick={() => moveImage(index, 'left')}
                                            className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 disabled:opacity-30 disabled:pointer-events-none transition-all"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            disabled={index === images.length - 1}
                                            onClick={() => moveImage(index, 'right')}
                                            className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 disabled:opacity-30 disabled:pointer-events-none transition-all"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Input to notify action about primary image index */}
            <input type="hidden" name="primaryImageIndex" value={images.findIndex(img => img.id === primaryId)} />
        </FormSection>
    );
}
