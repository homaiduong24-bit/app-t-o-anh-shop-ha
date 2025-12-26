
import React, { useState } from 'react';
import { AppState, AppMode, AspectRatio, PhotoStyleCategory, ProductCategory, UploadedImage } from './types';
import { ASPECT_RATIOS, PHOTO_STYLES, BANNER_STYLES, PRODUCT_CATEGORIES } from './constants';
import ImageUploader from './components/ImageUploader';
import { generateVariations, fileToGenerativePart } from './services/geminiService';

function App() {
  const [state, setState] = useState<AppState>({
    mode: AppMode.PHOTO, // Default mode
    productDescription: '',
    aspectRatio: AspectRatio.SQUARE,
    productCategory: ProductCategory.FOOD,
    selectedStyleId: PHOTO_STYLES[0].id,
    selectedBannerStyleId: BANNER_STYLES[0].id,
    inputImages: [],
    selectedImageId: null,
  });

  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // --- Handlers for Image Uploader ---
  const handleImagesAdd = (newImages: UploadedImage[]) => {
    setState(prev => {
      const updatedImages = [...prev.inputImages, ...newImages];
      // Auto-select the first image added if none selected
      const newSelectedId = prev.selectedImageId ? prev.selectedImageId : newImages[0].id;
      return {
        ...prev,
        inputImages: updatedImages,
        selectedImageId: newSelectedId
      };
    });
  };

  const handleImageSelect = (id: string) => {
    setState(prev => ({ ...prev, selectedImageId: id }));
  };

  const handleImageRemove = (id: string) => {
    setState(prev => {
      const filtered = prev.inputImages.filter(img => img.id !== id);
      let nextSelectedId = prev.selectedImageId;
      
      // If we removed the selected image, pick another one or null
      if (id === prev.selectedImageId) {
        nextSelectedId = filtered.length > 0 ? filtered[filtered.length - 1].id : null;
      }
      
      return {
        ...prev,
        inputImages: filtered,
        selectedImageId: nextSelectedId
      };
    });
  };
  // -----------------------------------

  const handleGenerate = async () => {
    if (!state.productDescription) return;
    if (state.inputImages.length === 0) return;

    // Logic preparation based on mode
    let imagesToProcess: { file: File }[] = [];
    let selectedStyle;

    if (state.mode === AppMode.PHOTO) {
        // Photo Mode: Use ONLY the selected image
        const selectedImage = state.inputImages.find(img => img.id === state.selectedImageId);
        if (!selectedImage) {
            setError("Vui lòng chọn 1 ảnh để xử lý.");
            return;
        }
        imagesToProcess = [selectedImage];
        selectedStyle = PHOTO_STYLES.find(s => s.id === state.selectedStyleId)!;
    } else {
        // Banner Mode: Use ALL uploaded images
        imagesToProcess = state.inputImages;
        selectedStyle = BANNER_STYLES.find(s => s.id === state.selectedBannerStyleId)!;
    }
    
    setLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      // Convert all required images to Base64
      const imagePromises = imagesToProcess.map(async (img) => ({
          base64: await fileToGenerativePart(img.file),
          mimeType: img.file.type
      }));
      const imageDataList = await Promise.all(imagePromises);

      const urls = await generateVariations({
        mode: state.mode,
        description: state.productDescription,
        category: state.productCategory,
        ratio: state.aspectRatio,
        style: selectedStyle,
        images: imageDataList, // Pass array of images
      });

      if (urls.length === 0) {
          setError("Không tạo được ảnh nào. Vui lòng thử lại với mô tả hoặc hình ảnh khác.");
      } else {
          // If we got partial results (less than 4) due to quota, still show them.
          setGeneratedImages(urls);
          if (urls.length < 4) {
             setError(`Đã tạo ${urls.length} phương án. Hệ thống dừng sớm do giới hạn tốc độ (Rate Limit).`);
          }
      }

    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("429") || err.code === 429 || err.status === 429) {
          setError("Hệ thống đang bận (Quá tải). Vui lòng đợi 1 phút và thử lại.");
      } else if (err.message?.includes("Requested entity was not found") || err.message?.includes("403") || err.status === 403) {
          setError("Lỗi quyền truy cập (403).");
      } else {
          setError(err.message || "Đã xảy ra lỗi không mong muốn khi tạo ảnh.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Group Photo styles for rendering
  const photoStylesByCategory = Object.values(PhotoStyleCategory).map(category => ({
    category,
    styles: PHOTO_STYLES.filter(s => s.category === category)
  }));

  const hasImages = state.inputImages.length > 0;
  const isReady = hasImages && state.productDescription && (state.mode === AppMode.BANNER || state.selectedImageId !== null);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-6 lg:p-8">
      <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
            ProShot <span className="text-indigo-400">AI Studio</span>
            </h1>
            <p className="text-slate-400 mt-1">Hệ thống tạo ảnh & Banner thương mại chuyên nghiệp</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT PANEL - CONTROLS */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* MODE SWITCHER */}
            <div className="bg-slate-800 rounded-xl p-1 border border-slate-700 flex">
                <button
                    onClick={() => setState(prev => ({ ...prev, mode: AppMode.PHOTO }))}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        state.mode === AppMode.PHOTO 
                        ? 'bg-indigo-600 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Chụp ảnh sản phẩm
                </button>
                <button
                    onClick={() => setState(prev => ({ ...prev, mode: AppMode.BANNER }))}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                        state.mode === AppMode.BANNER 
                        ? 'bg-pink-600 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Thiết kế Banner
                </button>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${state.mode === AppMode.BANNER ? 'bg-pink-500' : 'bg-indigo-500'}`}>1</span>
                    Thông tin & Hình ảnh
                </h2>
                
                <ImageUploader 
                    images={state.inputImages}
                    selectedId={state.selectedImageId}
                    onImagesAdd={handleImagesAdd}
                    onImageSelect={handleImageSelect}
                    onImageRemove={handleImageRemove}
                />
                
                {state.mode === AppMode.BANNER && state.inputImages.length > 0 && (
                     <p className="text-xs text-pink-400 mb-4 bg-pink-400/10 p-2 rounded border border-pink-400/20">
                        * Chế độ Banner sẽ sử dụng <strong>tất cả {state.inputImages.length} ảnh</strong> bạn đã tải lên để thiết kế.
                     </p>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Mô tả sản phẩm</label>
                        <input
                            type="text"
                            placeholder="Ví dụ: Bánh quy bơ socola, Dầu gội argan..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            value={state.productDescription}
                            onChange={(e) => setState(prev => ({ ...prev, productDescription: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Danh mục</label>
                        <div className="relative">
                            <select
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                                value={state.productCategory}
                                onChange={(e) => setState(prev => ({ ...prev, productCategory: e.target.value as ProductCategory }))}
                            >
                                {PRODUCT_CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-3 pointer-events-none text-slate-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Kích thước</label>
                        <div className="grid grid-cols-3 gap-2">
                            {ASPECT_RATIOS.map((ratio) => (
                                <button
                                    key={ratio.label}
                                    onClick={() => setState(prev => ({ ...prev, aspectRatio: ratio.value }))}
                                    className={`text-xs py-2 px-2 rounded-lg border transition-all ${
                                        state.aspectRatio === ratio.value 
                                        ? (state.mode === AppMode.BANNER ? 'bg-pink-600 border-pink-500 text-white' : 'bg-indigo-600 border-indigo-500 text-white')
                                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                                    }`}
                                >
                                    {ratio.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-700">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${state.mode === AppMode.BANNER ? 'bg-pink-500' : 'bg-indigo-500'}`}>2</span>
                        {state.mode === AppMode.BANNER ? 'Phong cách Banner' : 'Phong cách Chụp ảnh'}
                    </h2>
                    
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        
                        {state.mode === AppMode.PHOTO ? (
                            // --- PHOTO STYLES ---
                            photoStylesByCategory.map((group) => (
                                <div key={group.category}>
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 sticky top-0 bg-slate-800 py-1">{group.category}</h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {group.styles.map(style => (
                                            <button
                                                key={style.id}
                                                onClick={() => setState(prev => ({ ...prev, selectedStyleId: style.id }))}
                                                className={`text-left p-3 rounded-lg border transition-all flex flex-col ${
                                                    state.selectedStyleId === style.id
                                                    ? 'bg-indigo-900/40 border-indigo-500 shadow-sm shadow-indigo-900/20'
                                                    : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                                                }`}
                                            >
                                                <span className={`font-medium text-sm ${state.selectedStyleId === style.id ? 'text-indigo-300' : 'text-slate-200'}`}>
                                                    {style.label}
                                                </span>
                                                <span className="text-xs text-slate-500 mt-0.5 line-clamp-1">{style.description}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            // --- BANNER STYLES ---
                            <div className="grid grid-cols-1 gap-2">
                                {BANNER_STYLES.map(style => (
                                    <button
                                        key={style.id}
                                        onClick={() => setState(prev => ({ ...prev, selectedBannerStyleId: style.id }))}
                                        className={`text-left p-3 rounded-lg border transition-all flex flex-col ${
                                            state.selectedBannerStyleId === style.id
                                            ? 'bg-pink-900/40 border-pink-500 shadow-sm shadow-pink-900/20'
                                            : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                                        }`}
                                    >
                                        <span className={`font-medium text-sm ${state.selectedBannerStyleId === style.id ? 'text-pink-300' : 'text-slate-200'}`}>
                                            {style.label}
                                        </span>
                                        <span className="text-xs text-slate-500 mt-0.5">{style.description}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 sticky bottom-0 bg-slate-800 pt-4 z-10">
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !isReady}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform flex items-center justify-center gap-2
                            ${loading || !isReady
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : state.mode === AppMode.BANNER
                                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:from-pink-500 hover:to-rose-500 hover:shadow-pink-500/25 active:scale-[0.98]'
                                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/25 active:scale-[0.98]'
                            }`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {state.mode === AppMode.BANNER ? 'Đang thiết kế...' : 'Đang xử lý...'}
                            </>
                        ) : (
                            <>
                                <span>{state.mode === AppMode.BANNER ? 'Tạo 4 Banner' : 'Tạo 4 Phương Án'}</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </>
                        )}
                    </button>
                    {!hasImages && <p className="text-center text-xs text-slate-500 mt-2">Vui lòng tải ảnh lên để bắt đầu</p>}
                </div>
            </div>
        </div>

        {/* RIGHT PANEL - GALLERY */}
        <div className="lg:col-span-8">
            <div className={`h-full bg-slate-900/50 rounded-xl border p-6 flex flex-col min-h-[600px] transition-colors ${state.mode === AppMode.BANNER ? 'border-pink-500/20' : 'border-slate-800'}`}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Kết quả</h2>
                    {generatedImages.length > 0 && (
                        <span className={`text-xs px-3 py-1 rounded-full border ${state.mode === AppMode.BANNER ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'}`}>
                            {generatedImages.length === 4 ? 'Hoàn tất' : 'Hoàn tất (Một phần)'}
                        </span>
                    )}
                </div>

                {error && (
                    <div className={`border rounded-lg p-4 mb-6 text-sm flex items-start gap-3 ${
                        generatedImages.length > 0 
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-200' 
                        : 'bg-red-500/10 border-red-500/50 text-red-200'
                    }`}>
                        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <p>{error}</p>
                    </div>
                )}

                {loading ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-6">
                        <div className="relative w-24 h-24">
                             <div className={`absolute inset-0 border-t-4 rounded-full animate-spin ${state.mode === AppMode.BANNER ? 'border-pink-500' : 'border-indigo-500'}`}></div>
                             <div className={`absolute inset-3 border-t-4 rounded-full animate-spin reverse-spin ${state.mode === AppMode.BANNER ? 'border-rose-500' : 'border-violet-500'}`}></div>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-medium text-white">{state.mode === AppMode.BANNER ? 'Đang lên layout thiết kế...' : 'Đang thiết lập bối cảnh...'}</p>
                            <p className="text-sm mt-1">{state.mode === AppMode.BANNER ? 'Sắp xếp sản phẩm • Phối màu • Xử lý bố cục' : 'Phân tích hình học sản phẩm • Thiết lập ánh sáng • Dựng nền'}</p>
                            <p className="text-xs text-slate-600 mt-4 animate-pulse">Quá trình này có thể mất 30-60 giây để đảm bảo chất lượng.</p>
                        </div>
                     </div>
                ) : generatedImages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
                        {generatedImages.map((url, index) => (
                            <div key={index} className="group relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700 aspect-[4/5] md:aspect-auto shadow-lg">
                                <img src={url} alt={`Phương án ${index + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <p className="text-white font-medium text-sm mb-2">Phương án #{index + 1}</p>
                                    <a 
                                        href={url} 
                                        download={`proshot-${state.mode.toLowerCase()}-${index+1}.png`}
                                        className="w-full bg-white text-slate-900 font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                        Tải ảnh chất lượng cao
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                        <div className="w-20 h-20 mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                            <svg className="w-10 h-10 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                        <p className="font-medium">Chưa có ảnh nào được tạo</p>
                        <p className="text-sm max-w-xs text-center mt-2">Điền thông tin sản phẩm và chọn phong cách để bắt đầu.</p>
                    </div>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}

export default App;
