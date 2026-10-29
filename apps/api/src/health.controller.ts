import { Controller, Get } from '@nestjs/common';

// http://localhost:4000 açılınca api'nin çalıştığını gösterir
@Controller()
export class HealthController {
  @Get()
  status() {
    return {
      durum: 'API çalışıyor',
      not: 'Bu api adresidir. Siteyi görmek için http://localhost:3000 adresini açın.',
    };
  }
}
