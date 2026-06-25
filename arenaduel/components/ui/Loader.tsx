import React from 'react'

const Loader = (props : any) => {
  return (
    <div {...props} className='animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full' />
  )
}

export default Loader