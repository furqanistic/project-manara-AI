import React from 'react'

const WALL = 'stroke-[#171614]'
const WALL_RAW = 'stroke-[#3a3631]'
const TAUPE = '#8D775E'

const Door = ({ x, y, len = 30, rot = 0, raw = false }) => (
  <g
    transform={`translate(${x},${y}) rotate(${rot})`}
    className={raw ? 'stroke-[#3a3631]' : 'stroke-[#171614]'}
    strokeWidth={raw ? 1.2 : 2.5}
    fill='none'
    strokeLinecap='round'
  >
    <line x1='0' y1='0' x2='0' y2={-len} />
    <path d={`M 0 ${-len} A ${len} ${len} 0 0 1 ${len} 0`} />
  </g>
)

const Window = ({ x1, y1, x2, y2, raw = false }) => (
  <g
    className={raw ? 'stroke-[#8a837a]' : 'stroke-[#8D775E]'}
    strokeWidth={raw ? 1 : 1.6}
    fill='none'
  >
    <line x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray={raw ? '5 4' : 'none'} />
  </g>
)

const RoomLabel = ({ x, y, name, dim, raw = false }) => {
  if (raw) return null
  return (
    <g textAnchor='middle'>
      <text
        x={x}
        y={y}
        className='fill-[#171614]'
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 11.5,
          fontWeight: 600,
          letterSpacing: '0.14em',
        }}
      >
        {name}
      </text>
      <text
        x={x}
        y={y + 16}
        className='fill-[#8D775E]'
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.1em',
        }}
      >
        {dim}
      </text>
    </g>
  )
}

const Furniture = () => (
  <g
    className='stroke-[#8D775E]'
    strokeWidth={1.6}
    fill='#F1EBE1'
    strokeLinejoin='round'
  >
    {/* Kitchen counters */}
    <rect x='44' y='44' width='382' height='42' rx='2' />
    <circle cx='300' cy='65' r='11' fill='none' />
    <circle cx='326' cy='65' r='11' fill='none' />
    <rect x='44' y='86' width='42' height='100' rx='2' />
    <circle cx='65' cy='120' r='7' fill='none' />
    <circle cx='65' cy='142' r='7' fill='none' />
    {/* Kitchen island */}
    <rect x='190' y='95' width='180' height='56' rx='2' />
    <rect x='210' y='108' width='36' height='30' rx='2' fill='none' />
    <rect x='258' y='108' width='36' height='30' rx='2' fill='none' />
    <rect x='306' y='108' width='36' height='30' rx='2' fill='none' />
    {/* Dining table + chairs */}
    <rect x='130' y='240' width='200' height='88' rx='3' />
    <line x1='170' y1='240' x2='170' y2='328' strokeWidth='1' />
    <line x1='210' y1='240' x2='210' y2='328' strokeWidth='1' />
    <line x1='250' y1='240' x2='250' y2='328' strokeWidth='1' />
    <line x1='290' y1='240' x2='290' y2='328' strokeWidth='1' />
    <rect x='144' y='222' width='26' height='16' rx='2' />
    <rect x='196' y='222' width='26' height='16' rx='2' />
    <rect x='248' y='222' width='26' height='16' rx='2' />
    <rect x='300' y='222' width='26' height='16' rx='2' />
    <rect x='144' y='330' width='26' height='16' rx='2' />
    <rect x='196' y='330' width='26' height='16' rx='2' />
    {/* Living: sofa, coffee table, TV, armchairs */}
    <rect x='466' y='88' width='176' height='82' rx='3' />
    <line x1='466' y1='128' x2='642' y2='128' strokeWidth='1' />
    <rect x='660' y='118' width='72' height='72' rx='2' />
    <rect x='836' y='140' width='40' height='52' rx='2' />
    <rect x='466' y='236' width='56' height='56' rx='2' />
    <rect x='700' y='250' width='56' height='56' rx='2' />
    {/* Balcony table */}
    <circle cx='920' cy='140' r='16' />
    {/* Master bed + wardrobes */}
    <rect x='218' y='408' width='204' height='140' rx='3' />
    <line x1='218' y1='408' x2='422' y2='408' strokeWidth='2.4' />
    <rect x='218' y='386' width='46' height='20' rx='2' />
    <rect x='376' y='386' width='46' height='20' rx='2' />
    <rect x='220' y='380' width='224' height='8' fill='none' />
    {/* Closet shelving */}
    <line x1='46' y1='412' x2='164' y2='412' strokeWidth='1' />
    <line x1='46' y1='436' x2='164' y2='436' strokeWidth='1' />
    <line x1='46' y1='460' x2='164' y2='460' strokeWidth='1' />
    {/* Ensuite: tub, wc, basin */}
    <rect x='56' y='596' width='98' height='42' rx='4' />
    <circle cx='78' cy='556' r='10' />
    <rect x='112' y='552' width='40' height='26' rx='2' />
    {/* Bedroom 2 */}
    <rect x='628' y='408' width='204' height='102' rx='3' />
    <line x1='628' y1='408' x2='832' y2='408' strokeWidth='2.4' />
    <rect x='628' y='386' width='204' height='8' fill='none' />
    <rect x='876' y='388' width='76' height='34' rx='2' />
    {/* Bathroom 2: shower, wc, basin */}
    <rect x='630' y='548' width='52' height='30' rx='2' />
    <circle cx='648' cy='600' r='9' />
    <rect x='676' y='596' width='34' height='22' rx='2' />
    {/* Bedroom 3 */}
    <rect x='758' y='558' width='154' height='82' rx='3' />
    <line x1='758' y1='558' x2='912' y2='558' strokeWidth='2.4' />
    <rect x='760' y='548' width='96' height='8' fill='none' />
  </g>
)

const Annotations = () => (
  <g className='fill-[#8D775E]' stroke='#8D775E'>
    {/* North arrow */}
    <g transform='translate(920, 318)'>
      <circle r='26' fill='none' strokeWidth='1.4' />
      <path d='M 0 -18 L 7 10 L 0 4 L -7 10 Z' fill='#8D775E' stroke='none' />
      <text
        y='-32'
        textAnchor='middle'
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        N
      </text>
    </g>
    {/* Overall dimensions */}
    <g strokeWidth='1.4'>
      <line x1='40' y1='690' x2='960' y2='690' />
      <line x1='40' y1='684' x2='40' y2='696' />
      <line x1='960' y1='684' x2='960' y2='696' />
      <text
        x='500'
        y='684'
        textAnchor='middle'
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: '0.08em',
        }}
      >
        19,600 MM
      </text>
      <line x1='988' y1='40' x2='988' y2='660' />
      <line x1='982' y1='40' x2='994' y2='40' />
      <line x1='982' y1='660' x2='994' y2='660' />
      <text
        x='988'
        y='355'
        textAnchor='middle'
        style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: '0.08em',
        }}
      >
        13,400 MM
      </text>
    </g>
    {/* Room measurements */}
    <text
      x='235'
      y='158'
      textAnchor='middle'
      style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: '0.1em',
      }}
    >
      4.3 × 3.9 M
    </text>
    <text
      x='235'
      y='332'
      textAnchor='middle'
      style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: '0.1em',
      }}
    >
      4.3 × 3.5 M
    </text>
    <text
      x='665'
      y='296'
      textAnchor='middle'
      style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: '0.1em',
      }}
    >
      8.4 × 5.8 M
    </text>
    <text
      x='345'
      y='560'
      textAnchor='middle'
      style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: '0.1em',
      }}
    >
      4.8 × 4.6 M
    </text>
    <text
      x='785'
      y='494'
      textAnchor='middle'
      style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: '0.1em',
      }}
    >
      4.6 × 3.6 M
    </text>
    <text
      x='850'
      y='640'
      textAnchor='middle'
      style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: 9.5,
        fontWeight: 600,
        letterSpacing: '0.1em',
      }}
    >
      3.6 × 3.4 M
    </text>
  </g>
)

const RawSketch = () => (
  <g
    className='stroke-[#3a3631]'
    strokeWidth='1.4'
    fill='none'
    opacity='0.85'
  >
    {/* Rough hatch in a couple of rooms */}
    <g strokeWidth='0.8' opacity='0.5'>
      <line x1='60' y1='230' x2='90' y2='200' />
      <line x1='90' y1='230' x2='120' y2='200' />
      <line x1='120' y1='230' x2='150' y2='200' />
      <line x1='150' y1='230' x2='180' y2='200' />
      <line x1='180' y1='230' x2='210' y2='200' />
      <line x1='60' y1='260' x2='90' y2='230' />
      <line x1='90' y1='260' x2='120' y2='230' />
      <line x1='120' y1='260' x2='150' y2='230' />
      <line x1='150' y1='260' x2='180' y2='230' />
      <line x1='180' y1='260' x2='210' y2='230' />
    </g>
    <text
      x='900'
      y='420'
      textAnchor='end'
      className='fill-[#6f6a63]'
      style={{
        fontFamily: 'Manrope, sans-serif',
        fontSize: 10,
        fontStyle: 'italic',
        letterSpacing: '0.08em',
      }}
    >
      SOURCE DRAWING — AS BUILT
    </text>
  </g>
)

export const FloorPlanArt = ({ refined = true, className = '' }) => (
  <svg viewBox='0 0 1000 700' className={className} fill='none'>
    <g className={refined ? WALL : WALL_RAW} strokeLinecap='round'>
      {/* Outer walls */}
      <g strokeWidth={refined ? 10 : 3}>
        <line x1='45' y1='40' x2='960' y2='40' />
        <line x1='40' y1='45' x2='40' y2='660' />
        <line x1='960' y1='40' x2='960' y2='660' />
        <line x1='40' y1='655' x2='520' y2='655' />
        <line x1='560' y1='655' x2='960' y2='655' />
      </g>
      {/* Kitchen / Dining */}
      <g strokeWidth={refined ? 8 : 2.4}>
        <line x1='430' y1='40' x2='430' y2='190' />
        <line x1='40' y1='200' x2='200' y2='200' />
        <line x1='240' y1='200' x2='430' y2='200' />
        <line x1='430' y1='210' x2='430' y2='360' />
        {/* Living / dining divide */}
        <line x1='450' y1='40' x2='450' y2='210' />
        <line x1='450' y1='240' x2='450' y2='360' />
        {/* Living bottom band */}
        <line x1='450' y1='370' x2='520' y2='370' />
        <line x1='550' y1='370' x2='960' y2='370' />
        {/* Balcony wall */}
        <line x1='880' y1='40' x2='880' y2='180' />
        <line x1='880' y1='210' x2='880' y2='360' />
      </g>
      {/* Corridor */}
      <g strokeWidth={refined ? 8 : 2.4}>
        <line x1='500' y1='380' x2='590' y2='380' />
        <line x1='500' y1='380' x2='500' y2='660' />
        <line x1='590' y1='380' x2='590' y2='420' />
        <line x1='590' y1='450' x2='590' y2='560' />
        <line x1='590' y1='590' x2='590' y2='660' />
        <line x1='590' y1='620' x2='740' y2='620' />
      </g>
      {/* Master suite */}
      <g strokeWidth={refined ? 8 : 2.4}>
        <line x1='40' y1='380' x2='480' y2='380' />
        <line x1='480' y1='380' x2='480' y2='440' />
        <line x1='480' y1='470' x2='480' y2='660' />
        <line x1='170' y1='390' x2='170' y2='420' />
        <line x1='170' y1='450' x2='170' y2='480' />
        <line x1='40' y1='480' x2='170' y2='480' />
        <line x1='170' y1='580' x2='170' y2='600' />
        <line x1='170' y1='630' x2='170' y2='660' />
        <line x1='40' y1='580' x2='170' y2='580' />
      </g>
      {/* Bedroom 2 */}
      <g strokeWidth={refined ? 8 : 2.4}>
        <line x1='610' y1='380' x2='960' y2='380' />
        <line x1='610' y1='380' x2='610' y2='520' />
        <line x1='610' y1='520' x2='960' y2='520' />
      </g>
      {/* Bathroom 2 / Bedroom 3 */}
      <g strokeWidth={refined ? 8 : 2.4}>
        <line x1='610' y1='540' x2='720' y2='540' />
        <line x1='720' y1='540' x2='720' y2='620' />
        <line x1='610' y1='540' x2='610' y2='560' />
        <line x1='610' y1='590' x2='610' y2='620' />
        <line x1='740' y1='540' x2='960' y2='540' />
        <line x1='740' y1='540' x2='740' y2='620' />
        <line x1='740' y1='650' x2='740' y2='660' />
      </g>
      {/* Doors */}
      <Door x='560' y='660' len='32' rot='0' raw={!refined} />
      <Door x='550' y='370' len='30' rot='180' raw={!refined} />
      <Door x='480' y='470' len='30' rot='-90' raw={!refined} />
      <Door x='590' y='450' len='30' rot='90' raw={!refined} />
      <Door x='590' y='590' len='30' rot='90' raw={!refined} />
      <Door x='610' y='590' len='30' rot='90' raw={!refined} />
      <Door x='740' y='650' len='30' rot='-90' raw={!refined} />
      <Door x='880' y='210' len='30' rot='90' raw={!refined} />
      <Door x='450' y='240' len='30' rot='-90' raw={!refined} />
      <Door x='200' y='200' len='30' rot='-90' raw={!refined} />
      <Door x='170' y='450' len='26' rot='-90' raw={!refined} />
      <Door x='170' y='630' len='26' rot='90' raw={!refined} />
    </g>

    {/* Windows */}
    <g>
      <Window x1='140' y1='38' x2='390' y2='38' raw={!refined} />
      <Window x1='560' y1='38' x2='650' y2='38' raw={!refined} />
      <Window x1='760' y1='38' x2='860' y2='38' raw={!refined} />
      <Window x1='882' y1='140' x2='882' y2='320' raw={!refined} />
      <Window x1='958' y1='430' x2='958' y2='490' raw={!refined} />
      <Window x1='958' y1='570' x2='958' y2='630' raw={!refined} />
      <Window x1='760' y1='662' x2='900' y2='662' raw={!refined} />
      <Window x1='42' y1='430' x2='42' y2='540' raw={!refined} />
      <Window x1='42' y1='600' x2='42' y2='640' raw={!refined} />
    </g>
    {/* Balcony railing */}
    <g
      className={refined ? 'stroke-[#8D775E]' : 'stroke-[#8a837a]'}
      strokeWidth='1.4'
      strokeDasharray='6 5'
      fill='none'
    >
      <line x1='884' y1='60' x2='956' y2='60' />
      <line x1='884' y1='80' x2='956' y2='80' />
      <line x1='922' y1='44' x2='922' y2='356' />
    </g>

    {refined ? (
      <>
        <Furniture />
        <Annotations />
        <RoomLabel x='235' y='112' name='KITCHEN' dim='4.3 × 3.9 M' />
        <RoomLabel x='235' y='272' name='DINING' dim='4.3 × 3.5 M' />
        <RoomLabel x='665' y='196' name='LIVING & DINING' dim='62.8 M²' />
        <RoomLabel x='345' y='470' name='MASTER SUITE' dim='24.8 M²' />
        <RoomLabel x='785' y='446' name='BEDROOM 02' dim='18.6 M²' />
        <RoomLabel x='850' y='596' name='BEDROOM 03' dim='15.9 M²' />
        <text
          x='665'
          y='585'
          textAnchor='middle'
          className='fill-[#171614]'
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 8.5,
            fontWeight: 600,
            letterSpacing: '0.12em',
          }}
        >
          BATH 02
        </text>
        <text
          x='105'
          y='432'
          textAnchor='middle'
          className='fill-[#171614]'
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 8.5,
            fontWeight: 600,
            letterSpacing: '0.12em',
          }}
        >
          WALK-IN
        </text>
        <text
          x='105'
          y='618'
          textAnchor='middle'
          className='fill-[#171614]'
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 8.5,
            fontWeight: 600,
            letterSpacing: '0.12em',
          }}
        >
          ENSUITE
        </text>
        <text
          x='545'
          y='640'
          textAnchor='middle'
          className='fill-[#8D775E]'
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 8.5,
            fontWeight: 600,
            letterSpacing: '0.12em',
          }}
        >
          ENTRY
        </text>
      </>
    ) : (
      <RawSketch />
    )}
  </svg>
)
