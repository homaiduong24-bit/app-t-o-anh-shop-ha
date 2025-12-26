
import { GoogleGenAI } from "@google/genai";
import { AppMode, AspectRatio, PhotoStyleOption, BannerStyleOption, ProductCategory } from '../types';

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface ImageData {
  base64: string;
  mimeType: string;
}

interface GenerateOptions {
  mode: AppMode;
  description: string;
  category: ProductCategory;
  style: PhotoStyleOption | BannerStyleOption;
  ratio: AspectRatio;
  images: ImageData[]; // Changed to array to support multiple images
}

// Utility to pause execution (helper for rate limiting)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateProductImage = async (options: GenerateOptions): Promise<string | null> => {
  // Re-initialize client to ensure latest key is used from environment
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let systemInstruction = "";
  let prompt = "";

  if (options.mode === AppMode.BANNER) {
    // --- BANNER MODE PROMPT (Enhanced for Clarity & Cutout) ---
    systemInstruction = `Bạn là một chuyên gia thiết kế đồ họa (Graphic Designer) và Retoucher ảnh quảng cáo cao cấp.`;
    
    prompt = `
      NHIỆM VỤ:
      Thiết kế 1 Banner quảng cáo chất lượng cao (High-Resolution) dựa trên các sản phẩm được cung cấp.
      
      THÔNG TIN ĐẦU VÀO:
      - Loại sản phẩm: ${options.category}
      - Mô tả chi tiết: ${options.description}
      - Phong cách thiết kế: ${options.style.label}
      - Chi tiết phong cách: ${(options.style as BannerStyleOption).description}
      
      YÊU CẦU KỸ THUẬT TUYỆT ĐỐI (CRITICAL RULES):
      1. ĐỘ NÉT & CHỮ VIẾT: Hình ảnh sản phẩm phải SẮC NÉT. Chữ viết, logo, nhãn mác (text/label) trên bao bì phải RÕ RÀNG, ĐỌC ĐƯỢC, tuyệt đối không bị mờ, nhòe hay biến dạng pixel.
      2. TÁCH NỀN HOÀN HẢO (PERFECT CUTOUT): Việc tách nền sản phẩm khỏi ảnh gốc phải chính xác tuyệt đối (như cắt bằng Pen Tool). Các cạnh sản phẩm phải mượt mà, không được lẹm vào chi tiết, không để lại viền trắng (halo) xấu xí.
      3. SỬ DỤNG TẤT CẢ SẢN PHẨM: Đưa tất cả các ảnh input vào thiết kế. Sắp xếp bố cục (Layout) chuyên nghiệp.
      4. KHÔNG TẠO CHỮ (NO GENERATED TEXT): Không được tự ý thêm bất kỳ chữ, slogan, watermark nào vào ảnh (trừ chữ có sẵn trên bao bì sản phẩm gốc).
      5. THẨM MỸ: Bối cảnh và đạo cụ phải đúng phong cách "${options.style.label}". Sản phẩm là nhân vật chính (Hero), nổi bật nhất trên nền.
      
      HÃY TẠO RA MỘT BANNER SẮC NÉT, SẠCH SẼ VÀ CHUYÊN NGHIỆP.
    `;
  } else {
    // --- PHOTO MODE PROMPT (Original) ---
    systemInstruction = `Bạn là một nhiếp ảnh gia thương mại chuyên nghiệp (Commercial Product Photographer).`;
    
    prompt = `
      NHIỆM VỤ:
      Tạo ra hình ảnh sản phẩm chất lượng cao từ ảnh đầu vào, phù hợp phong cách và bối cảnh được yêu cầu.
      
      THÔNG TIN ĐẦU VÀO:
      - Loại sản phẩm: ${options.category}
      - Mô tả chi tiết: ${options.description}
      - Phong cách chụp: ${options.style.label}
      - Chi tiết phong cách: ${(options.style as PhotoStyleOption).description}
      
      YÊU CẦU TUYỆT ĐỐI (CRITICAL RULES):
      1. Giữ nguyên hình dạng, kích thước, màu sắc, chất liệu và mọi chi tiết của sản phẩm gốc trong ảnh đầu vào. Không được thay đổi mẫu mã, nhãn mác (labels), hay sticker.
      2. Tách nền sản phẩm chính xác và ghép vào bối cảnh mới một cách tự nhiên. Ánh sáng và bóng đổ phải thực tế.
      3. KHÔNG được thêm bất kỳ chữ (text), logo, watermark hay slogan nào vào ảnh.
      4. Bối cảnh phải đúng với phong cách đã chọn.
      5. Sản phẩm là trung tâm (hero). Đảm bảo sản phẩm rõ nét, không bị che khuất.
    `;
  }

  // Construct Content Parts
  const parts: any[] = [{ text: prompt }];
  
  // Add all images to the request
  options.images.forEach(img => {
    parts.push({
      inlineData: {
        mimeType: img.mimeType,
        data: img.base64
      }
    });
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      config: {
        systemInstruction: systemInstruction,
        imageConfig: {
          aspectRatio: options.ratio,
        },
      },
    });

    // Extract image
    if (response.candidates && response.candidates.length > 0) {
       for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
             return `data:image/png;base64,${part.inlineData.data}`;
          }
       }
    }
    return null;

  } catch (error) {
    // Log error but allow retries in the wrapper function
    console.error("Gemini Request Error:", error);
    throw error;
  }
};

export const generateVariations = async (options: GenerateOptions): Promise<string[]> => {
  const results: string[] = [];
  const TARGET_COUNT = 4;
  
  // Sequential generation with SMART Retry & Partial Success logic
  for (let i = 0; i < TARGET_COUNT; i++) {
    let attempt = 0;
    let success = false;
    
    // Significantly increased backoff times to handle strict rate limits
    // Strategy: 20s -> 40s -> give up
    let backoffTime = 20000; 

    // Retry loop for the current image
    while (attempt < 3 && !success) {
      try {
        const url = await generateProductImage(options);
        if (url) {
          results.push(url);
          success = true;
        }
      } catch (error: any) {
        console.warn(`Variation ${i+1} attempt ${attempt+1} failed:`, error.message);
        
        // Detect Quota/Rate Limit Errors
        const isQuotaError = error.status === 429 || 
                             error.code === 429 || 
                             error.message?.includes('429') || 
                             error.message?.includes('quota') ||
                             error.status === 'RESOURCE_EXHAUSTED';

        if (isQuotaError) {
          // --- PARTIAL SUCCESS STRATEGY ---
          // If we already have some results, STOP here and return them.
          if (results.length > 0) {
             console.log("Quota hit (429). Returning partial results to user.");
             return results;
          }

          // If we have 0 images, we MUST retry, but with LONG delays.
          attempt++;
          if (attempt < 3) {
            const waitTime = backoffTime;
            console.warn(`Quota hit. Retrying in ${waitTime/1000}s...`);
            await delay(waitTime);
            // Exponential backoff
            backoffTime = backoffTime * 2; 
          }
        } else {
          // If it's a fatal error (like 400 Bad Request), stop trying this image
          break;
        }
      }
    }

    // Rate Limiting: Wait longer between SUCCESSFUL requests
    // Increased to 8 seconds to be safer
    if (success && i < TARGET_COUNT - 1) {
      await delay(8000); 
    }
  }

  // If absolutely no images were generated after all retries
  if (results.length === 0) {
     throw new Error("Hệ thống đang bận (429 Resource Exhausted) hoặc hết hạn mức sử dụng. Vui lòng đợi 2-3 phút và thử lại.");
  }

  return results;
};
