import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { API_BASE_URL } from "@/config";
import { Button } from "@/components/ui/button";
import usePageTitle from "@/hooks/usePageTitle";

export default function WardrobePage() {
  usePageTitle("Wardrobe");
  const { user } = useAppContext();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", category: "top", imageUrl: "", tags: "" });

  const fetchWardrobe = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/wardrobe`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) setItems(await res.json());
    } catch (error) {
      console.error("Failed to fetch wardrobe:", error);
    }
  };

  useEffect(() => {
    if (user?.token) fetchWardrobe();
  }, [user?.token]);

  const addItem = async () => {
    if (!form.name.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/wardrobe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          category: form.category,
          imageUrl: form.imageUrl.trim(),
          tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        }),
      });
      if (res.ok) {
        setItems(await res.json());
        setForm({ name: "", category: "top", imageUrl: "", tags: "" });
      }
    } catch (error) {
      console.error("Failed to add wardrobe item:", error);
    }
  };

  const removeItem = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/wardrobe/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) setItems(await res.json());
    } catch (error) {
      console.error("Failed to remove wardrobe item:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Wardrobe Builder</h1>
        <p className="text-sm text-muted-foreground mt-1">Save your items and mix outfit ideas manually.</p>
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/40 p-4 grid md:grid-cols-5 gap-2">
        <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" placeholder="Item name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
        <select className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="footwear">Footwear</option>
          <option value="accessory">Accessory</option>
          <option value="other">Other</option>
        </select>
        <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" placeholder="Image URL (optional)" value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} />
        <input className="h-10 rounded-lg border border-input bg-background px-3 text-sm" placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} />
        <Button className="h-10 rounded-lg" onClick={addItem}>Add Item</Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No wardrobe items yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item._id} className="rounded-xl border border-border/40 bg-card/40 p-3">
              {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="h-36 w-full object-cover rounded-lg mb-2" /> : null}
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
              <p className="text-xs text-muted-foreground mt-1">{(item.tags || []).join(", ")}</p>
              <Button variant="destructive" size="sm" className="mt-3 rounded-lg" onClick={() => removeItem(item._id)}>Remove</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
