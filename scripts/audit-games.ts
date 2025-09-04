// MIFF Games Audit - Runner
import { auditHTML, auditCLI, checkAssets, checkOrchestration } from '../utils/auditTools'

type Game = {
  name: string
  path: string
  cli: string | null
  pureModule: string | null
}

const games: Game[] = [
  {
    name: 'Toppler',
    path: 'site/zones/toppler/index.html',
    cli: 'TopplerDemoPure/cliHarness.ts',
    pureModule: 'TopplerDemoPure',
  },
  {
    name: 'Spirit Tamer',
    path: 'site/zones/spirit_tamer/index.html',
    cli: 'SpiritTamerDemoPure/cliHarness.ts',
    pureModule: 'SpiritTamerDemoPure',
  },
  {
    name: 'Witcher Grove',
    path: 'site/zones/witcher_grove/index.html',
    cli: 'WitcherExplorerDemoPure/cliHarness.ts',
    pureModule: 'WitcherExplorerDemoPure',
  },
  {
    name: 'Remix Lab',
    path: 'site/zones/remix_lab/index.html',
    cli: null,
    pureModule: null,
  },
]

async function run() {
  let hadError = false
  for (const game of games) {
    // eslint-disable-next-line no-console
    console.log(`\n\n===== 🔍 Auditing ${game.name} =====`)

    const html = await auditHTML(game.path)
    html.details.forEach(d => console.log(d))
    if (!html.ok) hadError = true

    if (game.cli) {
      const cli = auditCLI(game.cli)
      cli.details.forEach(d => console.log(d))
      if (!cli.ok) hadError = true
    }

    if (game.pureModule) {
      const assets = await checkAssets(game.pureModule)
      assets.details.forEach(d => console.log(d))
      if (!assets.ok) hadError = true

      const orchestration = checkOrchestration(game.pureModule)
      orchestration.details.forEach(d => console.log(d))
      if (!orchestration.ok) hadError = true
    }
  }

  if (hadError) {
    // eslint-disable-next-line no-console
    console.error('\n❌ Audit completed with issues')
    process.exit(1)
  } else {
    // eslint-disable-next-line no-console
    console.log('\n✅ All audits passed')
  }
}

run().catch(err => {
  // eslint-disable-next-line no-console
  console.error('Fatal audit error:', err)
  process.exit(1)
})

