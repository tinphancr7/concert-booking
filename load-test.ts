import autocannon from 'autocannon'
import fs from 'fs'

const instance = autocannon(
  {
    url: 'http://localhost:5555/api/v1/bookings/681f0369e193bcd5958dfae3/book',
    connections: 1,
    duration: 10,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODFlMmNhOTQzNjQwYjI1OThjYTNiNTMiLCJpYXQiOjE3NDY5Nzk1MzEsImV4cCI6MTc0NzA2NTkzMX0.o6u9PXII_cKcr4Hk523eBMMNjcN04039dpwHLmRBVi0`
    },
    body: JSON.stringify({
      seatType: 'VIP'
    })
  },
  (err, result) => {
    if (err) {
      console.error('Load test failed:', err)
      return
    }

    fs.writeFileSync('result.json', JSON.stringify(result, null, 2))
    console.log('✅ Result saved to result.json')
  }
)
