export function formatDate(value: string | Date) { return new Intl.DateTimeFormat("en-NG",{dateStyle:"medium"}).format(new Date(value)); }
export function titleCase(value: string) { return value.replace(/[-_]/g," ").replace(/\b\w/g,char=>char.toUpperCase()); }
