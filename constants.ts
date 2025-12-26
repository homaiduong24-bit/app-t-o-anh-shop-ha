
import { AspectRatio, BannerStyleOption, PhotoStyleCategory, PhotoStyleOption, ProductCategory } from './types';

export const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: AspectRatio.SQUARE, label: "1:1 (Vuông)" },
  { value: AspectRatio.PORTRAIT_4_5, label: "4:5 (Dọc)" },
  { value: AspectRatio.PANORAMA_8_3, label: "8:3 (Panorama)" },
  { value: AspectRatio.LANDSCAPE_3_2, label: "3:2 (Tiêu chuẩn)" },
  { value: AspectRatio.MOBILE_9_16, label: "9:16 (Story)" },
  { value: AspectRatio.LANDSCAPE_16_9, label: "16:9 (Điện ảnh)" },
];

export const PRODUCT_CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: ProductCategory.FOOD, label: "Đồ ăn" },
  { value: ProductCategory.SNACKS, label: "Bánh kẹo" },
  { value: ProductCategory.DRINKS, label: "Đồ uống" },
  { value: ProductCategory.SHAMPOO, label: "Dầu gội" },
  { value: ProductCategory.BODY_WASH, label: "Sữa tắm" },
  { value: ProductCategory.PERSONAL_CARE, label: "Chăm sóc cá nhân khác" },
  { value: ProductCategory.GIFT_COMBO, label: "Combo quà tặng" },
];

export const PHOTO_STYLES: PhotoStyleOption[] = [
  // Studio / E-commerce (NEW)
  { id: 'studio_white', category: PhotoStyleCategory.STUDIO, label: 'Nền trắng (E-commerce)', description: 'Nền trắng tinh khiết (#FFFFFF), ánh sáng studio chuyên nghiệp, bóng đổ tự nhiên dưới chân sản phẩm.' },
  { id: 'studio_clean', category: PhotoStyleCategory.STUDIO, label: 'Studio tối giản', description: 'Nền xám nhạt hoặc be trung tính, tập trung hoàn toàn vào sản phẩm.' },

  // Creative
  { id: 'creative_splash', category: PhotoStyleCategory.CREATIVE, label: 'Splash nước / Năng lượng', description: 'Nước bắn động lực học, năng lượng cao, chuyển động đóng băng.' },
  { id: 'creative_neon', category: PhotoStyleCategory.CREATIVE, label: 'Neon / Màu nổi bật', description: 'Màu sắc rực rỡ, ánh sáng neon, tương phản mạnh.' },
  { id: 'creative_dynamic', category: PhotoStyleCategory.CREATIVE, label: 'Chuyển động động', description: 'Vật thể lơ lửng, hiệu ứng mờ chuyển động, đạo cụ nghệ thuật.' },
  
  // Lifestyle
  { id: 'life_table', category: PhotoStyleCategory.LIFESTYLE, label: 'Bàn ăn', description: 'Bàn ăn ấm cúng, khăn ăn, dao nĩa, ánh sáng ấm.' },
  { id: 'life_office', category: PhotoStyleCategory.LIFESTYLE, label: 'Văn phòng', description: 'Bàn làm việc chuyên nghiệp, laptop, sổ tay, ánh sáng sạch.' },
  { id: 'life_kitchen', category: PhotoStyleCategory.LIFESTYLE, label: 'Phòng bếp hiện đại', description: 'Mặt đá cẩm thạch, nguyên liệu nhà bếp, sáng sủa và thoáng đãng.' },
  { id: 'life_picnic', category: PhotoStyleCategory.LIFESTYLE, label: 'Dã ngoại / Picnic', description: 'Bãi cỏ, ánh nắng, khăn trải picnic, không khí tự nhiên.' },
  { id: 'life_cafe', category: PhotoStyleCategory.LIFESTYLE, label: 'Quán cà phê', description: 'Bàn gỗ, hậu cảnh bokeh, không gian quán cafe.' },
  { id: 'life_spa', category: PhotoStyleCategory.LIFESTYLE, label: 'Phòng tắm / Spa', description: 'Gạch men, khăn tắm, cây xanh, không khí thiền, giọt nước.' },

  // Flat Lay
  { id: 'flat_min', category: PhotoStyleCategory.FLAT_LAY, label: 'Flat Lay Tối giản', description: 'Nền sạch, đạo cụ ngăn nắp, góc nhìn từ trên xuống.' },
  { id: 'flat_prop', category: PhotoStyleCategory.FLAT_LAY, label: 'Flat Lay Có đạo cụ', description: 'Được bao quanh bởi nguyên liệu/vật dụng liên quan, sắp xếp nghệ thuật.' },

  // Macro
  { id: 'macro_tex', category: PhotoStyleCategory.MACRO, label: 'Cận cảnh chất liệu', description: 'Cận cảnh cực đại vào chất lượng vật liệu.' },
  { id: 'macro_fresh', category: PhotoStyleCategory.MACRO, label: 'Độ tươi (Giọt nước)', description: 'Hơi lạnh ngưng tụ, giọt nước, đá lạnh, vẻ ngoài tươi mát.' },
  { id: 'macro_foam', category: PhotoStyleCategory.MACRO, label: 'Bọt / Gel', description: 'Làm nổi bật kết cấu chất lỏng, bong bóng và độ đặc.' },
];

export const BANNER_STYLES: BannerStyleOption[] = [
  { id: 'banner_studio', label: '1. Banner Studio (Product Focus)', description: 'Nền đơn sắc (trắng/đen/be/pastel), ánh sáng đẹp, bóng nhẹ. Không đạo cụ phức tạp. Dễ đọc text.' },
  { id: 'banner_food', label: '2. Banner Food Styling', description: 'Đạo cụ food props (khăn, muỗng, dĩa, mảnh vụn), ánh sáng ấm. Tạo cảm giác "ngon - muốn ăn ngay".' },
  { id: 'banner_lifestyle', label: '3. Banner Lifestyle', description: 'Bối cảnh thực tế: Bàn ăn, Dã ngoại hoặc Văn phòng tùy theo sản phẩm.' },
  { id: 'banner_concept', label: '4. Banner Concept - Sáng tạo', description: 'Nền gradient, hình học, 3D shapes. Nhiều khoảng âm (negative space).' },
  { id: 'banner_moody', label: '5. Banner Moody - Cinematic', description: 'Ánh sáng tương phản mạnh. Tone trầm - sang trọng.' },
  { id: 'banner_pop', label: '6. Banner Pop / Colorful / Gen Z', description: 'Neon / pastel sáng. Yếu tố vui nhộn, trẻ trung.' },
  { id: 'banner_minimal', label: '7. Banner Minimal Clean', description: 'Nền sáng, ít chi tiết. Tối giản, sạch, chuẩn thương hiệu.' },
  { id: 'banner_ecommerce', label: '8. Banner E-commerce Chuẩn Sàn', description: 'Nền đơn giản. Tối ưu hiển thị Shopee/Lazada/TikTok Shop.' },
  { id: 'banner_poster', label: '9. Banner Poster / Event', description: 'Dùng cho các chương trình sale. Layout mạnh mẽ.' },
];
