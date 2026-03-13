import { Outlet } from 'react-router';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useAuth } from '../auth';
import { ROUTES } from '../constants';
import { CommandPalletIcon, GlobalTypeHead } from '@components/index';
import { Sidenav } from '../components/Sidenav';
import { Toast } from '../components/Toast';
import { navigationItems } from '../data/navigationItems';

import * as sx from './AppLayout.sx';

export function AppLayout() {
    return (
        <Box sx={sx.root}>
            {/* Sidebar */}
            <Box component="aside" sx={sx.aside}>
                <Sidenav items={navigationItems} />
            </Box>

            {/* Right side: header + content + footer */}
            <Box sx={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', overflow: 'hidden' }}>
                {/* Header */}
                <AppBar
                    position="static"
                    color="transparent"
                    elevation={0}
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                    }}
                >
                    <Toolbar variant="dense" sx={{ justifyContent: 'flex-end' }}>
                        {status === 'authenticated' && user && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <CommandPalletIcon />
                                <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                    {user.name}
                                </Typography>
                                <Button size="small" variant="outlined" onClick={logout}>
                                    Sign out
                                </Button>
                            </Box>
                        )}
                    </Toolbar>
                </AppBar>
                {/* <GlobalTypeHead open={false}/> */}
                {/* Main */}
                <Box component="main" sx={sx.main}>
                    <Outlet />
                </Box>

                {/* Footer */}
                <Box
                    component="footer"
                    sx={{
                        borderTop: 1,
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        px: 2,
                        py: 0.5,
                    }}
                >
                    <Typography variant="body2" sx={{ opacity: 0.5 }}>
                        Status Bar
                    </Typography>
                </Box>
            </Box>

            <Toast />
        </Box>
    );
}


{
  "name": "mock-api",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "express": "^4.21.0",
    "typesense": "^1.8.2"
  }
}
folder name
mock-api-typeahead
server.js 
import express from "express";
import Typesense from "typesense";

const app = express();
app.use(express.json());

const orders = [
    { id: "1",  number: "ORD-001", customer: "Netflix" },
    { id: "2",  number: "ORD-002", customer: "Amazon" },
    { id: "3",  number: "ORD-003", customer: "Google" },
    { id: "4",  number: "ORD-004", customer: "Microsoft" },
    { id: "5",  number: "ORD-005", customer: "Apple" },
    { id: "6",  number: "ORD-006", customer: "Meta" },
    { id: "7",  number: "ORD-007", customer: "Spotify" },
    { id: "8",  number: "ORD-008", customer: "Tesla" },
    { id: "9",  number: "ORD-009", customer: "Nvidia" },
    { id: "10", number: "ORD-010", customer: "Salesforce" },
    { id: "11", number: "ORD-011", customer: "Adobe" },
    { id: "12", number: "ORD-012", customer: "Netflix" },
    { id: "13", number: "ORD-013", customer: "Amazon Web Services" },
    { id: "14", number: "ORD-014", customer: "Stripe" },
    { id: "15", number: "ORD-015", customer: "Shopify" },
];

const TYPESENSE_HOST = process.env.TYPESENSE_HOST ?? "typesense";
const TYPESENSE_PORT = Number(process.env.TYPESENSE_PORT ?? 8108);
const TYPESENSE_API_KEY = process.env.TYPESENSE_API_KEY ?? "xyz";

const typesense = new Typesense.Client({
    nodes: [{ host: TYPESENSE_HOST, port: TYPESENSE_PORT, protocol: "http" }],
    apiKey: TYPESENSE_API_KEY,
    connectionTimeoutSeconds: 5,
});

const ordersSchema = {
    name: "orders",
    fields: [
        { name: "number",   type: "string" },
        { name: "customer", type: "string" },
    ],
};


async function retry(fn, { retries = 10, delayMs = 2000, label = "" } = {}) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            console.log(
                `[seed] ${label} attempt ${attempt}/${retries} failed – ${err.message}`
            );
            if (attempt === retries) throw err;
            await new Promise((r) => setTimeout(r, delayMs));
        }
    }
}


async function seedTypesense() {
    await retry(() => typesense.health.retrieve(), {
        label: "health-check",
    });
    console.log("[seed] Typesense is healthy ✓");

    try {
        await typesense.collections("orders").delete();
        console.log("[seed] Dropped existing 'orders' collection");
    } catch {
        // Ignore for now
    }

    await typesense.collections().create(ordersSchema);
    console.log("[seed] Created 'orders' collection");

    const results = await typesense
        .collections("orders")
        .documents()
        .import(orders, { action: "create" });

    const successCount = results.filter((r) => r.success).length;
    console.log(`[seed] Indexed ${successCount}/${orders.length} orders`);
}

app.get("/orders", (_req, res) => {
    res.json(orders);
});

app.get("/orders/:id", (req, res) => {
    const order = orders.find((o) => o.id === req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
});


app.get("/orders/search", async (req, res) => {
    const q = req.query.q ?? "*";
    try {
        const result = await typesense
            .collections("orders")
            .documents()
            .search({ q: String(q), query_by: "number,customer" });
        res.json(result);
    } catch (err) {
        res.status(502).json({ error: "Typesense search failed", detail: err.message });
    }
});


app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});


async function start() {
    try {
        await seedTypesense();
    } catch (err) {
        console.error("[seed] Failed to seed Typesense:", err.message);
        console.error("[seed] The REST API will still start, but search will not work.");
    }

    app.listen(4000, () => {
        console.log("Mock-API running on http://0.0.0.0:4000");
    });
}

start();

npm init -t 
npm install package.json