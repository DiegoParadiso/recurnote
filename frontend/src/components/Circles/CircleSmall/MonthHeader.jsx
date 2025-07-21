export default function MonthHeader({ date, position, onClick }) {
  const mesNombre = date.setLocale('es').toFormat('LLLL yyyy');

  let style = {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    textAlign: 'center',
    userSelect: 'none',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#374151',
    fontSize: '0.85rem',
    transition: 'all 0.3s ease',
    cursor: onClick ? 'pointer' : 'default',
    pointerEvents: onClick ? 'auto' : 'none',
  };

  if (position === 'previous') {
    style = {
      ...style,
      top: '40%',
      opacity: 0.35,
      fontSize: '0.8rem',
      filter: 'grayscale(80%)',
    };
  } else if (position === 'next') {
    style = {
      ...style,
      top: '55%',
      opacity: 0.35,
      fontSize: '0.8rem',
      filter: 'grayscale(80%)',
    };
  } else if (position === 'current') {
    style = {
      ...style,
      top: '50%',
      transform: 'translate(-50%, -50%)',
      opacity: 1,
      fontSize: '1.4rem',
      color: '#111827',
      pointerEvents: 'none',
      cursor: 'default',
    };
  }

  return (
    <h2 style={style} onClick={onClick}>
      {mesNombre}
    </h2>
  );
}
