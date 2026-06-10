// Ghost code lines — real Proof project snippets for terminal background
export const GHOST_CODE_LINES: string[] = [
  'CREATE TABLE challenges (',
  '  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,',
  '  creator_id uuid REFERENCES profiles(id),',
  '  challenge_type text NOT NULL,',
  '  status text DEFAULT \'pending\',',
  '  verified_at timestamptz',
  ');',
  '',
  'ALTER TABLE proofs ADD COLUMN ai_confidence float;',
  'ALTER TABLE proofs ADD COLUMN liveness_score float;',
  '',
  'CREATE POLICY "Users can view own proofs"',
  '  ON proofs FOR SELECT',
  '  USING (auth.uid() = user_id);',
  '',
  'interface TelegramWebApp {',
  '  initData: string;',
  '  initDataUnsafe: WebAppInitData;',
  '  version: string;',
  '  platform: string;',
  '  themeParams: ThemeParams;',
  '  isExpanded: boolean;',
  '  ready(): void;',
  '  expand(): void;',
  '  close(): void;',
  '}',
  '',
  'const { data: proof } = await supabase',
  '  .storage.from(\'proofs\')',
  '  .upload(path, file);',
  '',
  'const result = await model.generateContent([',
  '  { inlineData: { data: base64, mimeType } },',
  '  { text: VERIFICATION_PROMPT }',
  ']);',
  '',
  'CREATE OR REPLACE FUNCTION calculate_xp(',
  '  p_user_id uuid',
  ') RETURNS integer AS $$',
  '  SELECT COALESCE(SUM(xp_earned), 0)',
  '  FROM challenge_completions',
  '  WHERE user_id = p_user_id;',
  '$$ LANGUAGE sql STABLE;',
  '',
  'const tonConnect = new TonConnect({',
  '  manifestUrl: MANIFEST_URL',
  '});',
  'await tonConnect.sendTransaction(tx);',
  '',
  'export const verifyProof = async (req: Request) => {',
  '  const { videoUrl, challengeId } = await req.json();',
  '  const frames = await extractKeyFrames(videoUrl);',
  '  const analysis = await gemini.analyze(frames);',
  '  return new Response(JSON.stringify(analysis));',
  '};',
  '',
  'CREATE TRIGGER on_challenge_complete',
  '  AFTER UPDATE ON challenges',
  '  FOR EACH ROW',
  '  WHEN (NEW.status = \'verified\')',
  '  EXECUTE FUNCTION award_xp();',
  '',
  'interface ProofSubmission {',
  '  challengeId: string;',
  '  videoBlob: Blob;',
  '  metadata: {',
  '    duration: number;',
  '    resolution: [number, number];',
  '    timestamp: number;',
  '  };',
  '}',
]

// Boring CRUD code for slider left state
export const BORING_CODE = `async function getUser(id: string) {
  const res = await fetch(
    '/api/users/' + id
  );
  if (!res.ok) {
    throw new Error('Not found');
  }
  return res.json();
}

async function updateUser(
  id: string,
  data: Partial<User>
) {
  const res = await fetch(
    '/api/users/' + id,
    {
      method: 'PATCH',
      headers: {
        'Content-Type':
          'application/json',
      },
      body: JSON.stringify(data),
    }
  );
  return res.json();
}`

// Architecture nodes for slider right state
export interface ArchNode {
  id: string
  labelKey: string
  x: number  // SVG x position
  y: number  // SVG y position
  width: number
  connections: string[]
}

// Vertical tree layout — fits well in a narrow card
export const ARCHITECTURE_NODES: ArchNode[] = [
  { id: 'tma',     labelKey: 'arch.tma',     x: 125, y: 10,  width: 150, connections: ['auth', 'storage'] },
  { id: 'auth',    labelKey: 'arch.auth',     x: 20,  y: 115, width: 130, connections: ['edge'] },
  { id: 'storage', labelKey: 'arch.storage',  x: 250, y: 115, width: 130, connections: ['edge'] },
  { id: 'edge',    labelKey: 'arch.edge',     x: 110, y: 220, width: 180, connections: ['gemini', 'db'] },
  { id: 'gemini',  labelKey: 'arch.gemini',   x: 10,  y: 325, width: 160, connections: [] },
  { id: 'db',      labelKey: 'arch.db',       x: 230, y: 325, width: 160, connections: ['feed'] },
  { id: 'feed',    labelKey: 'arch.feed',     x: 230, y: 415, width: 160, connections: [] },
]
