export async function resizeToSquare(file: File, size = 256): Promise<Blob> {
    const bitmap = await createImageBitmap(file)
  
    // Recorte centrado al cuadrado más grande posible
    const side = Math.min(bitmap.width, bitmap.height)
    const sx = (bitmap.width - side) / 2
    const sy = (bitmap.height - side) / 2
  
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    canvas.getContext('2d')!.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size)
    bitmap.close()
  
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo convertir'))),
        'image/webp',
        0.85
      )
    })
  }