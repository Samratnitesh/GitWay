// 'use client';

// import { useEffect, useState } from 'react';
// import useProject from '~/hooks/use-project';
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
// } from 'recharts';
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardContent,
// } from '~/components/ui/card';
// import {
//   Table,
//   TableHeader,
//   TableBody,
//   TableRow,
//   TableCell,
//   TableHead,
// } from '~/components/ui/table';

// type Contributor = {
//   login: string;
//   contributions: number;
//   avatar_url: string;
//   html_url: string;
// };

// export default function ContributionPage() {
//   const { project } = useProject();
//   const [contributors, setContributors] = useState<Contributor[]>([]);
//   const [commitData, setCommitData] = useState<{ label: string; commits: number }[]>([]);
//   const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!project) return;

//     const match = project.repoUrl.match(/github\.com\/([^/]+)\/([^/]+)(\/|$)/);
//     if (!match) {
//       setError('Invalid GitHub repo URL.');
//       return;
//     }

//     const [_, owner, repo] = match;

//     async function fetchContributors() {
//       try {
//         const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors`);
//         if (!res.ok) throw new Error('');
//         const data = await res.json();
//         setContributors(data);
//       } catch (err) {
//         setError((err as Error).message);
//       }
//     }

//     async function fetchCommitActivity() {
//       try {
//         const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/stats/commit_activity`
//         );
//         if (!res.ok) throw new Error('');
//         const raw = await res.json();

//         if (!Array.isArray(raw)) {
//           setTimeout(() => fetchCommitActivity(), 2000); // Retry in 5 seconds
//           return;
//         }

//         const data = raw;

//         if (viewMode === 'weekly') {
//           const weeklyFormatted = data.map((week: any) => ({
//             label: new Date(week.week * 1000).toLocaleDateString('en-US', {
//               month: 'short',
//               day: 'numeric',
//             }),
//             commits: week.total,
//           }));
//           setCommitData(weeklyFormatted.slice(-12));
//         } else {
//           const monthly: Record<string, number> = {};
//           data.forEach((week: any) => {
//             const month = new Date(week.week * 1000).toLocaleDateString('en-US', {
//               month: 'short',
//               year: 'numeric',
//             });
//             monthly[month] = (monthly[month] || 0) + week.total;
//           });
//           const monthlyFormatted = Object.entries(monthly).map(([label, commits]) => ({ label, commits }));
//           setCommitData(monthlyFormatted.slice(-6));
//         }
//       } catch (err) {
//         setError((err as Error).message);
//       }
//     }

//     fetchContributors();
//     fetchCommitActivity();
//   }, [project, viewMode]);

//   if (!project) {
//     return <p className="p-4 text-red-500">Please select or create a project first.</p>;
//   }

//   return (
//     <div className="p-8 space-y-6">
//       {/* <h1 className="text-2xl font-bold">Contribution Leaderboard</h1> */}

//       {error && <p className="text-red-500">{error}</p>}

//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//           <CardTitle className="text-lg font-semibold">
//             Commits ({viewMode === 'weekly' ? 'Last 12 Weeks' : 'Last 6 Months'})
//           </CardTitle>
//           <button
//             onClick={() => setViewMode(viewMode === 'weekly' ? 'monthly' : 'weekly')}
//             className="text-sm bg-muted px-3 py-1 rounded hover:bg-muted/80"
//           >
//             Switch to {viewMode === 'weekly' ? 'Monthly' : 'Weekly'}
//           </button>
//         </CardHeader>
//         <CardContent>
//           {commitData.length === 0 ? (
//             <p className="text-sm text-muted-foreground">No commit data available.</p>
//           ) : (
//             <ResponsiveContainer width="100%" height={300}>
//               <AreaChart data={commitData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
//                 <defs>
//                   <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
//                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
//                   </linearGradient>
//                 </defs>
//                 <XAxis dataKey="label" stroke="#888888" />
//                 <YAxis stroke="#888888" />
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <Tooltip
//                   contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '0.375rem' }}
//                   labelStyle={{ color: '#6b7280' }}
//                 />
//                 <Area
//                   type="monotone"
//                   dataKey="commits"
//                   stroke="#3b82f6"
//                   fill="url(#colorCommits)"
//                   strokeWidth={2}
//                   activeDot={{ r: 6 }}
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           )}
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle className="text-lg font-semibold">Top Contributors</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Avatar</TableHead>
//                 <TableHead>Developer</TableHead>
//                 <TableHead className="text-right">Commits</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {contributors.map((contributor) => (
//                 <TableRow key={contributor.login}>
//                   <TableCell>
//                     <img
//                       src={contributor.avatar_url}
//                       alt={contributor.login}
//                       className="w-8 h-8 rounded-full"
//                     />
//                   </TableCell>
//                   <TableCell>
//                     <a
//                       href={contributor.html_url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:underline"
//                     >
//                       {contributor.login}
//                     </a>
//                   </TableCell>
//                   <TableCell className="text-right">{contributor.contributions}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
