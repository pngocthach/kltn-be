export function parseToMongoDate(dateString: string) {
  const parts = dateString.split("/");

  if (parts.length === 3) {
    // Format: YYYY/M/D
    const [year, month, day] = parts.map(Number);
    return new Date(Date.UTC(year, month - 1, day)); // UTC để tránh lỗi múi giờ
  } else if (parts.length === 1) {
    // Format: YYYY
    const year = Number(parts[0]);
    return new Date(Date.UTC(year, 0, 1)); // Mặc định là 1/1 của năm đó
  } else {
    return null; // Trả về null nếu format không hợp lệ
  }
}
