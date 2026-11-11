/** category isometric art on a mint tile; hides the image if that art file isn't generated yet */
export function CatArt({ art, size }: { art: string; size: number }) {
  return (
    <span className="shrink-0 rounded-xl bg-pucuk-50 flex items-center justify-center" style={{ width: size, height: size }}>
      <img src={`img/cat/${art}.png`} alt="" width={size} height={size} className="object-contain" style={{ width: size, height: size }}
        onError={e => { e.currentTarget.style.visibility = 'hidden'; }} />
    </span>
  );
}
